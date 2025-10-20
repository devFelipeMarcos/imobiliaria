"use client";

import React, { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Upload, 
  File, 
  Download, 
  Trash2, 
  AlertCircle, 
  CheckCircle,
  Loader2,
  FileText,
  Image,
  FileSpreadsheet
} from 'lucide-react';
import { toast } from 'sonner';

interface UploadedFile {
  name: string;
  size: number;
  type: string;
  key: string;
  url: string;
  uploadedAt: string;
}

interface FileUploadProps {
  onFileUploaded?: (file: UploadedFile) => void;
  onFileDeleted?: (key: string) => void;
  maxFiles?: number;
  initialFiles?: UploadedFile[];
}

export default function FileUpload({ 
  onFileUploaded, 
  onFileDeleted, 
  maxFiles = 10,
  initialFiles = []
}: FileUploadProps) {
  const [files, setFiles] = useState<UploadedFile[]>(initialFiles);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (type: string) => {
    if (type.startsWith('image/')) return <Image className="h-4 w-4" />;
    if (type.includes('spreadsheet') || type.includes('excel')) return <FileSpreadsheet className="h-4 w-4" />;
    if (type.includes('pdf') || type.includes('document') || type.includes('word')) return <FileText className="h-4 w-4" />;
    return <File className="h-4 w-4" />;
  };

  const handleFileSelect = async (selectedFiles: FileList) => {
    console.log('🔄 [FileUpload] Iniciando processo de upload');
    console.log('📁 [FileUpload] Arquivos selecionados:', selectedFiles.length);
    console.log('📊 [FileUpload] Arquivos atuais:', files.length);
    console.log('📋 [FileUpload] Máximo permitido:', maxFiles);

    if (files.length + selectedFiles.length > maxFiles) {
      console.log('❌ [FileUpload] Limite de arquivos excedido');
      toast.error(`Máximo de ${maxFiles} arquivos permitidos`);
      return;
    }

    setUploading(true);
    console.log('⏳ [FileUpload] Estado de upload definido como true');

    for (let i = 0; i < selectedFiles.length; i++) {
      const file = selectedFiles[i];
      console.log(`📤 [FileUpload] Processando arquivo ${i + 1}/${selectedFiles.length}:`, {
        name: file.name,
        size: file.size,
        type: file.type
      });
      
      try {
        const formData = new FormData();
        formData.append('file', file);
        console.log('📦 [FileUpload] FormData criado para:', file.name);

        console.log('🌐 [FileUpload] Enviando requisição para /api/upload');
        const response = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });

        console.log('📡 [FileUpload] Resposta recebida:', {
          status: response.status,
          statusText: response.statusText,
          ok: response.ok
        });

        const result = await response.json();
        console.log('📄 [FileUpload] Resultado parseado:', result);

        if (result.success) {
          const newFile: UploadedFile = result.file;
          console.log('✅ [FileUpload] Upload bem-sucedido:', newFile);
          setFiles(prev => [...prev, newFile]);
          onFileUploaded?.(newFile);
          toast.success(`${file.name} enviado com sucesso!`);
        } else {
          console.log('❌ [FileUpload] Erro no upload:', result.error);
          toast.error(`Erro ao enviar ${file.name}: ${result.error}`);
        }
      } catch (error) {
        console.error('💥 [FileUpload] Erro no upload:', error);
        toast.error(`Erro ao enviar ${file.name}`);
      }
    }

    setUploading(false);
    console.log('✅ [FileUpload] Processo de upload finalizado');
  };

  const handleDownload = async (file: UploadedFile) => {
    try {
      const response = await fetch(`/api/download?key=${encodeURIComponent(file.key)}`);
      const result = await response.json();

      if (result.success) {
        // Abrir URL de download em nova aba
        window.open(result.downloadUrl, '_blank');
        toast.success('Download iniciado!');
      } else {
        toast.error(`Erro no download: ${result.error}`);
      }
    } catch (error) {
      console.error('Erro no download:', error);
      toast.error('Erro ao fazer download do arquivo');
    }
  };

  const handleDelete = async (file: UploadedFile) => {
    if (!confirm(`Tem certeza que deseja deletar ${file.name}?`)) {
      return;
    }

    try {
      const response = await fetch(`/api/download?key=${encodeURIComponent(file.key)}`, {
        method: 'DELETE',
      });

      const result = await response.json();

      if (result.success) {
        setFiles(prev => prev.filter(f => f.key !== file.key));
        onFileDeleted?.(file.key);
        toast.success('Arquivo deletado com sucesso!');
      } else {
        toast.error(`Erro ao deletar: ${result.error}`);
      }
    } catch (error) {
      console.error('Erro ao deletar:', error);
      toast.error('Erro ao deletar arquivo');
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    console.log('🖱️ [FileUpload] Drag over detectado');
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    console.log('🖱️ [FileUpload] Drag leave detectado');
    e.preventDefault();
    setDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    console.log('🖱️ [FileUpload] Drop detectado');
    e.preventDefault();
    setDragOver(false);
    
    const droppedFiles = e.dataTransfer.files;
    console.log('📁 [FileUpload] Arquivos arrastados:', droppedFiles.length);
    if (droppedFiles.length > 0) {
      console.log('✅ [FileUpload] Chamando handleFileSelect com arquivos arrastados');
      handleFileSelect(droppedFiles);
    } else {
      console.log('❌ [FileUpload] Nenhum arquivo foi arrastado');
    }
  };

  return (
    <Card className="bg-white/10 backdrop-blur-sm border border-white/20 shadow-xl">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <div className="p-2 rounded-lg bg-gradient-to-r from-blue-500 to-purple-500">
            <Upload className="h-5 w-5" />
          </div>
          📁 Gerenciar Arquivos
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Área de Upload */}
        <div
          className={`border-2 border-dashed rounded-lg p-6 text-center transition-all duration-300 ${
            dragOver 
              ? 'border-blue-400 bg-blue-500/10' 
              : 'border-white/30 hover:border-white/50'
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <input
            ref={fileInputRef}
            type="file"
            multiple
            className="hidden"
            onChange={(e) => {
              console.log('📂 [FileUpload] Input onChange disparado');
              console.log('📋 [FileUpload] Event target:', e.target);
              console.log('📁 [FileUpload] Files selecionados:', e.target.files);
              if (e.target.files) {
                console.log('✅ [FileUpload] Chamando handleFileSelect com', e.target.files.length, 'arquivos');
                handleFileSelect(e.target.files);
              } else {
                console.log('❌ [FileUpload] Nenhum arquivo selecionado');
              }
            }}
            accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.gif,.txt"
          />
          
          {uploading ? (
            <div className="flex flex-col items-center gap-2">
              <Loader2 className="h-8 w-8 text-blue-400 animate-spin" />
              <p className="text-blue-200">Enviando arquivos...</p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <Upload className="h-8 w-8 text-blue-400" />
              <p className="text-blue-200">
                Arraste arquivos aqui ou{' '}
                <button
                  onClick={() => {
                    console.log('🖱️ [FileUpload] Botão "clique para selecionar" foi clicado');
                    console.log('📁 [FileUpload] Referência do input:', fileInputRef.current);
                    fileInputRef.current?.click();
                  }}
                  className="text-blue-400 hover:text-blue-300 underline"
                >
                  clique para selecionar
                </button>
              </p>
              <p className="text-xs text-blue-300">
                Máximo {maxFiles} arquivos • PDF, DOC, XLS, IMG, TXT • Até 10MB cada
              </p>
            </div>
          )}
        </div>

        {/* Lista de Arquivos */}
        {files.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-white font-medium">Arquivos ({files.length}/{maxFiles})</h4>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {files.map((file, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg hover:bg-white/10 transition-all duration-300"
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="text-blue-400">
                      {getFileIcon(file.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-sm font-medium truncate">
                        {file.name}
                      </p>
                      <div className="flex items-center gap-2 text-xs text-blue-200">
                        <span>{formatFileSize(file.size)}</span>
                        <span>•</span>
                        <span>{new Date(file.uploadedAt).toLocaleDateString('pt-BR')}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleDownload(file)}
                      className="text-blue-400 hover:text-blue-300 hover:bg-blue-500/20"
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleDelete(file)}
                      className="text-red-400 hover:text-red-300 hover:bg-red-500/20"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Informações */}
        <div className="flex items-start gap-2 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
          <AlertCircle className="h-4 w-4 text-blue-400 mt-0.5 flex-shrink-0" />
          <div className="text-xs text-blue-200">
            <p className="font-medium mb-1">Tipos de arquivo suportados:</p>
            <p>PDF, DOC, DOCX, XLS, XLSX, JPG, PNG, GIF, TXT</p>
            <p className="mt-1">Tamanho máximo: 10MB por arquivo</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}