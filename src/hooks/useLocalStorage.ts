import { useState, useEffect } from 'react';

type SetValue<T> = (value: T | ((val: T) => T)) => void;

export default function useLocalStorage<T>(key: string, initialValue: T): [T, SetValue<T>] {
  // 로컬 스토리지에서 값을 가져오는 함수
  const readValue = (): T => {
    if (typeof window === 'undefined') {
      return initialValue;
    }

    try {
      const item = window.localStorage.getItem(key);
      return item ? (JSON.parse(item) as T) : initialValue;
    } catch (error) {
      console.warn(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  };

  // 초기 상태 설정
  const [storedValue, setStoredValue] = useState<T>(readValue);

  // 값을 설정하고 로컬 스토리지에 저장하는 함수
  const setValue: SetValue<T> = (value) => {
    try {
      // 값이 함수인 경우 함수를 실행하여 새 값을 얻음
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      
      // 상태 업데이트
      setStoredValue(valueToStore);
      
      // 로컬 스토리지에 저장
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
      }
    } catch (error) {
      console.warn(`Error setting localStorage key "${key}":`, error);
    }
  };

  // 다른 탭에서 발생하는 스토리지 이벤트 감지
  useEffect(() => {
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === key && event.newValue) {
        setStoredValue(JSON.parse(event.newValue));
      }
    };

    // 이벤트 리스너 등록
    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [key]);

  return [storedValue, setValue];
}
