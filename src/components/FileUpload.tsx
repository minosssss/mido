// src/components/FileUpload.tsx
import { useState, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { UploadCloud, AlertCircle, CheckCircle2, FileSpreadsheet } from 'lucide-react';
import { parseExcelData } from '@/lib/excel-parser';
import type { Place, PlaceCategory } from '@/types';

interface FileUploadProps {
  onDataParsed: (data: Place[], category: PlaceCategory) => void;
  category: PlaceCategory;
  onError?: (error: string) => void;
  idPrefix?: string;
  aggregateTypeField?: string;
}

interface FileUploadState {
  isDragging: boolean;
  progress: number;
  error: string | null;
  success: string | null;
  isProcessing: boolean;
}

export default function FileUpload({
  onDataParsed,
  category,
  onError,
  idPrefix,
  aggregateTypeField,
}: FileUploadProps) {
  const [state, setState] = useState<FileUploadState>({
    isDragging: false,
    progress: 0,
    error: null,
    success: null,
    isProcessing: false,
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  // 드래그 이벤트 핸들러
  const handleDragEnter = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setState(prev => ({ ...prev, isDragging: true }));
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setState(prev => ({ ...prev, isDragging: true }));
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer) {
      e.dataTransfer.dropEffect = 'copy';
    }
  }, []);

  // 파일 처리 함수
  const processFile = useCallback(async (file: File) => {
    // 파일 형식 검증
    const validExts = ['.xlsx', '.xls'];
    const fileExt = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
    
    if (!validExts.includes(fileExt)) {
      const errorMsg = `잘못된 파일 형식입니다. Excel 파일(.xlsx, .xls)만 업로드 가능합니다.`;
      setState(prev => ({ ...prev, error: errorMsg, isProcessing: false }));
      if (onError) onError(errorMsg);
      return;
    }

    // 파일 크기 검증 (10MB 제한)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      const errorMsg = `파일 크기가 너무 큽니다. 최대 10MB까지 업로드 가능합니다.`;
      setState(prev => ({ ...prev, error: errorMsg, isProcessing: false }));
      if (onError) onError(errorMsg);
      return;
    }

    try {
      setState(prev => ({ 
        ...prev, 
        isProcessing: true, 
        progress: 10, 
        error: null,
        success: null
      }));

      // 파일을 ArrayBuffer로 읽기
      const buffer = await new Promise<ArrayBuffer>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = e => {
          if (e.target?.result instanceof ArrayBuffer) {
            resolve(e.target.result);
          } else {
            reject(new Error('Failed to read file as ArrayBuffer'));
          }
        };
        reader.onerror = () => reject(reader.error);
        setState(prev => ({ ...prev, progress: 30 }));
        reader.readAsArrayBuffer(file);
      });

      setState(prev => ({ ...prev, progress: 50 }));

      // 엑셀 데이터 파싱
      const places = await parseExcelData(buffer, category, {
        idPrefix,
        aggregateTypeField
      });

      setState(prev => ({ ...prev, progress: 90 }));

      if (places.length === 0) {
        throw new Error('유효한 데이터가 없습니다. 파일 형식을 확인해주세요.');
      }

      // 성공 처리
      setState(prev => ({ 
        ...prev, 
        progress: 100, 
        isProcessing: false,
        success: `${places.length}개의 업체 데이터를 성공적으로 불러왔습니다.` 
      }));
      
      // 부모 컴포넌트에 데이터 전달
      onDataParsed(places, category);
      
    } catch (error) {
      console.error('엑셀 파일 처리 중 오류:', error);
      const errorMsg = error instanceof Error ? error.message : '파일 처리 중 오류가 발생했습니다.';
      setState(prev => ({ 
        ...prev, 
        error: errorMsg, 
        isProcessing: false,
        progress: 0 
      }));
      if (onError) onError(errorMsg);
    }
  }, [category, idPrefix, aggregateTypeField, onDataParsed, onError]);

  // 파일 드롭 핸들러
  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    
    setState(prev => ({ ...prev, isDragging: false }));

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      processFile(file);
    }
  }, [processFile]);

  // 파일 선택 핸들러
  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      processFile(file);
      // 같은 파일을 다시 선택할 수 있도록 input 초기화
      e.target.value = '';
    }
  }, [processFile]);

  // 파일 선택 버튼 클릭 핸들러
  const handleButtonClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-lg">{category} 데이터 업로드</CardTitle>
        <CardDescription>
          Excel 파일(.xlsx, .xls)을 업로드하여 업체 데이터를 추가하세요.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* 드래그 앤 드롭 영역 */}
        <div
          className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
            ${state.isDragging ? 'border-primary bg-primary/10' : 'border-gray-300 hover:border-primary/50'}`}
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          onClick={handleButtonClick}
        >
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            accept=".xlsx,.xls"
            onChange={handleFileChange}
            disabled={state.isProcessing}
          />
          
          <div className="flex flex-col items-center justify-center space-y-3">
            {state.isProcessing ? (
              <>
                <FileSpreadsheet className="h-10 w-10 text-primary animate-pulse" />
                <p>파일 처리 중...</p>
              </>
            ) : (
              <>
                <UploadCloud className="h-10 w-10 text-gray-400" />
                <p>파일을 이곳에 끌어다 놓거나 클릭하여 선택하세요</p>
                <p className="text-xs text-gray-500">
                  지원 형식: .xlsx, .xls (최대 10MB)
                </p>
              </>
            )}
          </div>
        </div>

        {/* 진행률 표시 */}
        {state.isProcessing && (
          <div className="mt-4">
            <Progress value={state.progress} className="h-2" />
            <p className="text-xs text-center mt-1 text-gray-500">
              {state.progress}% 완료됨
            </p>
          </div>
        )}

        {/* 오류 메시지 */}
        {state.error && (
          <Alert variant="destructive" className="mt-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{state.error}</AlertDescription>
          </Alert>
        )}

        {/* 성공 메시지 */}
        {state.success && (
          <Alert variant="default" className="mt-4 bg-green-50 border-green-200 text-green-800">
            <CheckCircle2 className="h-4 w-4" />
            <AlertDescription>{state.success}</AlertDescription>
          </Alert>
        )}
      </CardContent>

      <CardFooter className="flex justify-between">
        <Button
          variant="outline"
          onClick={() => setState(prev => ({ 
            ...prev, 
            error: null,
            success: null,
            progress: 0
          }))}
          disabled={state.isProcessing}
        >
          초기화
        </Button>
        <Button 
          onClick={handleButtonClick}
          disabled={state.isProcessing}
        >
          파일 선택
        </Button>
      </CardFooter>
    </Card>
  );
}
