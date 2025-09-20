import React, { useRef, useEffect, useState, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { 
  Pen, 
  Type, 
  Eraser, 
  Undo, 
  Redo, 
  Trash2, 
  Upload,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Square,
  Circle,
  Triangle,
  Minus,
  ChevronUp,
  ChevronDown,
  FolderOpen,
  Video,
  VideoOff,
  Users,
  Maximize2,
  Minimize2
} from 'lucide-react';
import * as pdfjsLib from 'pdfjs-dist';
import DocumentLoader from '../components/whiteboard/DocumentLoader';
import VideoConference from '../components/video/VideoConference';
import { useAuthStore } from '../store/authStore';

interface Point {
  x: number;
  y: number;
}

interface DrawingElement {
  id: string;
  type: 'pen' | 'text' | 'shape' | 'line';
  points?: Point[];
  text?: string;
  position?: Point;
  color: string;
  size: number;
  shapeType?: 'rectangle' | 'circle' | 'triangle';
  width?: number;
  height?: number;
  timestamp: number;
}

type Tool = 'pen' | 'text' | 'eraser' | 'rectangle' | 'circle' | 'triangle' | 'line';

export const WhiteboardPage: React.FC = () => {
  const { classId } = useParams<{ classId: string }>();
  const { user } = useAuthStore();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const backgroundCanvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [currentTool, setCurrentTool] = useState<Tool>('pen');
  const [penColor, setPenColor] = useState('#000000');
  const [penSize, setPenSize] = useState(3);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentPath, setCurrentPath] = useState<Point[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [textInput, setTextInput] = useState('');
  const [textPosition, setTextPosition] = useState<Point | null>(null);
  const [elements, setElements] = useState<DrawingElement[]>([]);
  const [history, setHistory] = useState<DrawingElement[][]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [backgroundImage, setBackgroundImage] = useState<HTMLImageElement | null>(null);
  const [startPoint, setStartPoint] = useState<Point | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [pdfDocument, setPdfDocument] = useState<any>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [pdfPages, setPdfPages] = useState<HTMLCanvasElement[]>([]);
  const [showDocumentLoader, setShowDocumentLoader] = useState(false);
  const [loadedImageUrls, setLoadedImageUrls] = useState<string[]>([]);
  const [showVideoConference, setShowVideoConference] = useState(false);
  const [videoMode, setVideoMode] = useState<'minimized' | 'split' | 'fullscreen'>('minimized');

  // Initialize PDF.js
  useEffect(() => {
    // Try different worker sources
    const trySetWorker = async () => {
      const workerSources = [
        // Try local first
        '/node_modules/pdfjs-dist/build/pdf.worker.min.js',
        // Then try CDN with correct version
        'https://unpkg.com/pdfjs-dist@5.4.149/build/pdf.worker.min.js',
        'https://cdn.jsdelivr.net/npm/pdfjs-dist@5.4.149/build/pdf.worker.min.js'
      ];
      
      for (const workerSrc of workerSources) {
        try {
          pdfjsLib.GlobalWorkerOptions.workerSrc = workerSrc;
          console.log('PDF.js worker set to:', workerSrc);
          return;
        } catch (error) {
          console.warn('Failed to set worker source:', workerSrc, error);
        }
      }
      
      // If all fail, disable worker (fallback mode)
      console.warn('All worker sources failed, using fallback mode');
      pdfjsLib.GlobalWorkerOptions.workerSrc = '';
    };
    
    trySetWorker();
  }, []);

  // Initialize canvases
  useEffect(() => {
    const canvas = canvasRef.current;
    const backgroundCanvas = backgroundCanvasRef.current;
    if (!canvas || !backgroundCanvas) return;

    const resizeCanvases = () => {
      const rect = canvas.parentElement?.getBoundingClientRect();
      if (rect) {
        canvas.width = rect.width;
        canvas.height = rect.height;
        backgroundCanvas.width = rect.width;
        backgroundCanvas.height = rect.height;
        redrawCanvas();
        redrawBackground();
      }
    };

    resizeCanvases();
    window.addEventListener('resize', resizeCanvases);

    return () => {
      window.removeEventListener('resize', resizeCanvases);
    };
  }, []);

  // Redraw background
  const redrawBackground = useCallback(() => {
    const canvas = backgroundCanvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw PDF pages or background image
    if (pdfPages.length > 0) {
      try {
        // Draw all PDF pages vertically
        let yOffset = 0;
        const pageSpacing = 20;
        
        pdfPages.forEach((pageCanvas, index) => {
          if (pageCanvas) {
            // Calculate scale to fit canvas width
            const scale = Math.min(canvas.width / pageCanvas.width, 1);
            const drawWidth = pageCanvas.width * scale;
            const drawHeight = pageCanvas.height * scale;
            const drawX = (canvas.width - drawWidth) / 2;
            
            ctx.drawImage(pageCanvas, drawX, yOffset, drawWidth, drawHeight);
            yOffset += drawHeight + pageSpacing;
          }
        });
      } catch (error) {
        console.error('Error drawing PDF pages:', error);
      }
    } else if (backgroundImage) {
      try {
        // Simple approach: fit image to canvas while maintaining aspect ratio
        const canvasAspect = canvas.width / canvas.height;
        const imageAspect = backgroundImage.width / backgroundImage.height;
        
        let drawWidth, drawHeight, drawX, drawY;
        
        if (imageAspect > canvasAspect) {
          // Image is wider - fit to width
          drawWidth = canvas.width;
          drawHeight = canvas.width / imageAspect;
          drawX = 0;
          drawY = (canvas.height - drawHeight) / 2;
        } else {
          // Image is taller - fit to height
          drawHeight = canvas.height;
          drawWidth = canvas.height * imageAspect;
          drawX = (canvas.width - drawWidth) / 2;
          drawY = 0;
        }
        
        ctx.drawImage(backgroundImage, drawX, drawY, drawWidth, drawHeight);
      } catch (error) {
        console.error('Error drawing background image:', error);
      }
    }
  }, [backgroundImage, zoom, pan, pdfPages]);

  // Redraw canvas
  const redrawCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    ctx.save();
    ctx.scale(zoom, zoom);
    ctx.translate(pan.x, pan.y);

    // Draw all elements
    elements.forEach((element) => {
      ctx.strokeStyle = element.color;
      ctx.fillStyle = element.color;
      ctx.lineWidth = element.size;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      switch (element.type) {
        case 'pen':
          if (element.points && element.points.length > 1) {
            ctx.beginPath();
            ctx.moveTo(element.points[0].x, element.points[0].y);
            for (let i = 1; i < element.points.length; i++) {
              ctx.lineTo(element.points[i].x, element.points[i].y);
            }
            ctx.stroke();
          }
          break;

        case 'text':
          if (element.text && element.position) {
            ctx.font = `${element.size + 12}px Arial`;
            ctx.fillText(element.text, element.position.x, element.position.y);
          }
          break;

        case 'shape':
          if (element.position && element.width && element.height) {
            ctx.beginPath();
            switch (element.shapeType) {
              case 'rectangle':
                ctx.rect(element.position.x, element.position.y, element.width, element.height);
                break;
              case 'circle':
                const radius = Math.min(element.width, element.height) / 2;
                ctx.arc(
                  element.position.x + element.width / 2,
                  element.position.y + element.height / 2,
                  radius,
                  0,
                  2 * Math.PI
                );
                break;
              case 'triangle':
                ctx.moveTo(element.position.x + element.width / 2, element.position.y);
                ctx.lineTo(element.position.x, element.position.y + element.height);
                ctx.lineTo(element.position.x + element.width, element.position.y + element.height);
                ctx.closePath();
                break;
            }
            ctx.stroke();
          }
          break;

        case 'line':
          if (element.points && element.points.length >= 2) {
            ctx.beginPath();
            ctx.moveTo(element.points[0].x, element.points[0].y);
            ctx.lineTo(element.points[1].x, element.points[1].y);
            ctx.stroke();
          }
          break;
      }
    });

    // Draw current path while drawing
    if (isDrawing && currentPath.length > 0 && currentTool === 'pen') {
      ctx.strokeStyle = penColor;
      ctx.lineWidth = penSize;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      
      if (currentPath.length === 1) {
        // Draw a dot for single point
        ctx.beginPath();
        ctx.arc(currentPath[0].x, currentPath[0].y, penSize / 2, 0, 2 * Math.PI);
        ctx.fill();
      } else {
        // Draw line for multiple points
        ctx.beginPath();
        ctx.moveTo(currentPath[0].x, currentPath[0].y);
        for (let i = 1; i < currentPath.length; i++) {
          ctx.lineTo(currentPath[i].x, currentPath[i].y);
        }
        ctx.stroke();
      }
    }

    ctx.restore();
  }, [elements, zoom, pan, isDrawing, currentPath, currentTool, penColor, penSize]);

  useEffect(() => {
    redrawCanvas();
  }, [redrawCanvas]);

  useEffect(() => {
    redrawBackground();
  }, [redrawBackground]);

  // Force redraw when background image changes
  useEffect(() => {
    if (backgroundImage) {
      setTimeout(() => {
        redrawBackground();
      }, 100);
    }
  }, [backgroundImage, redrawBackground]);

  // Get mouse position
  const getMousePos = (e: React.MouseEvent<HTMLCanvasElement>): Point => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };

    const rect = canvas.getBoundingClientRect();
    return {
      x: (e.clientX - rect.left - pan.x * zoom) / zoom,
      y: (e.clientY - rect.top - pan.y * zoom) / zoom
    };
  };

  // Save to history
  const saveToHistory = () => {
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push([...elements]);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  };

  // Erase elements at position
  const eraseAtPosition = (pos: Point) => {
    const eraseRadius = penSize * 2;
    setElements(prev => prev.filter(element => {
      if (element.type === 'text' && element.position) {
        const distance = Math.sqrt(
          Math.pow(element.position.x - pos.x, 2) + 
          Math.pow(element.position.y - pos.y, 2)
        );
        return distance > eraseRadius;
      }
      
      if (element.type === 'pen' && element.points) {
        // Check if any point in the path is within erase radius
        return !element.points.some(point => {
          const distance = Math.sqrt(
            Math.pow(point.x - pos.x, 2) + 
            Math.pow(point.y - pos.y, 2)
          );
          return distance <= eraseRadius;
        });
      }
      
      if (element.type === 'shape' && element.position) {
        // Check if eraser intersects with shape bounds
        const withinX = pos.x >= element.position.x && pos.x <= element.position.x + (element.width || 0);
        const withinY = pos.y >= element.position.y && pos.y <= element.position.y + (element.height || 0);
        return !(withinX && withinY);
      }
      
      if (element.type === 'line' && element.points && element.points.length >= 2) {
        // Check distance to line
        const [p1, p2] = element.points;
        const lineDistance = distanceToLine(pos, p1, p2);
        return lineDistance > eraseRadius;
      }
      
      return true;
    }));
  };

  // Calculate distance from point to line
  const distanceToLine = (point: Point, lineStart: Point, lineEnd: Point): number => {
    const A = point.x - lineStart.x;
    const B = point.y - lineStart.y;
    const C = lineEnd.x - lineStart.x;
    const D = lineEnd.y - lineStart.y;

    const dot = A * C + B * D;
    const lenSq = C * C + D * D;
    
    if (lenSq === 0) return Math.sqrt(A * A + B * B);
    
    let param = dot / lenSq;
    param = Math.max(0, Math.min(1, param));
    
    const xx = lineStart.x + param * C;
    const yy = lineStart.y + param * D;
    
    const dx = point.x - xx;
    const dy = point.y - yy;
    
    return Math.sqrt(dx * dx + dy * dy);
  };

  // Resize image for better performance
  const resizeImage = (file: File, maxWidth: number = 1920, maxHeight: number = 1080): Promise<string> => {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      
      img.onload = () => {
        // Calculate new dimensions
        let { width, height } = img;
        
        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height);
          width *= ratio;
          height *= ratio;
        }
        
        canvas.width = width;
        canvas.height = height;
        
        // Draw and compress
        ctx?.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', 0.8));
      };
      
      img.src = URL.createObjectURL(file);
    });
  };

  // Render PDF using PDF.js
  const handlePDFUpload = async (file: File) => {
    try {
      console.log('Starting PDF upload:', file.name, 'Size:', file.size);
      setIsUploading(true);
      setUploadProgress(10);
      
      // Validate file size (max 50MB)
      if (file.size > 50 * 1024 * 1024) {
        throw new Error('File PDF quá lớn (tối đa 50MB)');
      }
      
      // Convert file to ArrayBuffer
      console.log('Converting file to ArrayBuffer...');
      const arrayBuffer = await file.arrayBuffer();
      setUploadProgress(30);
      
      // Load PDF document with minimal options
      console.log('Loading PDF document...');
      const loadingTask = pdfjsLib.getDocument({
        data: arrayBuffer,
        verbosity: 0 // Reduce console output
      });
      
      const pdf = await loadingTask.promise;
      console.log('PDF loaded successfully, pages:', pdf.numPages);
      
      setPdfDocument(pdf);
      setTotalPages(pdf.numPages);
      setCurrentPage(1);
      setUploadProgress(50);
      
      // Limit pages for performance (max 20 pages)
      const maxPages = Math.min(pdf.numPages, 20);
      if (pdf.numPages > 20) {
        console.warn(`PDF has ${pdf.numPages} pages, only rendering first 20 for performance`);
      }
      
      // Render pages
      const pages: HTMLCanvasElement[] = [];
      
      for (let pageNum = 1; pageNum <= maxPages; pageNum++) {
        try {
          console.log(`Rendering page ${pageNum}/${maxPages}...`);
          const page = await pdf.getPage(pageNum);
          const viewport = page.getViewport({ scale: 1.2 }); // Reduce scale for better performance
          
          // Create canvas for this page
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          canvas.width = viewport.width;
          canvas.height = viewport.height;
          
          if (ctx) {
            // Render page to canvas
            await page.render({
              canvasContext: ctx,
              viewport: viewport,
              canvas: canvas
            }).promise;
            
            pages.push(canvas);
            console.log(`Page ${pageNum} rendered successfully`);
          }
          
          // Update progress
          setUploadProgress(50 + (pageNum / maxPages) * 40);
        } catch (pageError) {
          console.error(`Error rendering page ${pageNum}:`, pageError);
          // Continue with other pages
        }
      }
      
      if (pages.length === 0) {
        throw new Error('Không thể render được trang nào của PDF');
      }
      
      setPdfPages(pages);
      setBackgroundImage(null); // Clear any existing background image
      setUploadProgress(100);
      
      setIsUploading(false);
      setUploadProgress(0);
      
      const message = pdf.numPages > 20 
        ? `✅ Đã tải PDF thành công: ${file.name}\nHiển thị 20/${pdf.numPages} trang đầu tiên - Bạn có thể scroll để xem và vẽ trên tài liệu.`
        : `✅ Đã tải PDF thành công: ${file.name}\n${pdf.numPages} trang - Bạn có thể scroll để xem các trang và vẽ trên tài liệu.`;
      
      alert(message);
      
      // Force redraw after PDF loads
      setTimeout(() => {
        redrawBackground();
        redrawCanvas();
      }, 100);
      
    } catch (error: any) {
      console.error('PDF upload error:', error);
      
      // If it's a worker error, try without worker
      if (error.message?.includes('worker') || error.message?.includes('fetch')) {
        console.log('Trying PDF loading without worker...');
        try {
          // Disable worker and try again
          const originalWorkerSrc = pdfjsLib.GlobalWorkerOptions.workerSrc;
          pdfjsLib.GlobalWorkerOptions.workerSrc = '';
          
          const arrayBuffer = await file.arrayBuffer();
          const loadingTask = pdfjsLib.getDocument({
            data: arrayBuffer,
            verbosity: 0,
            useWorkerFetch: false
          });
          
          const pdf = await loadingTask.promise;
          console.log('PDF loaded successfully without worker, pages:', pdf.numPages);
          
          setPdfDocument(pdf);
          setTotalPages(pdf.numPages);
          setCurrentPage(1);
          setUploadProgress(50);
          
          // Continue with rendering...
          const maxPages = Math.min(pdf.numPages, 10); // Limit to 10 pages without worker
          const pages: HTMLCanvasElement[] = [];
          
          for (let pageNum = 1; pageNum <= maxPages; pageNum++) {
            try {
              const page = await pdf.getPage(pageNum);
              const viewport = page.getViewport({ scale: 1.0 });
              
              const canvas = document.createElement('canvas');
              const ctx = canvas.getContext('2d');
              canvas.width = viewport.width;
              canvas.height = viewport.height;
              
              if (ctx) {
                await page.render({
                  canvasContext: ctx,
                  viewport: viewport,
                  canvas: canvas
                }).promise;
                
                pages.push(canvas);
              }
              
              setUploadProgress(50 + (pageNum / maxPages) * 40);
            } catch (pageError) {
              console.error(`Error rendering page ${pageNum}:`, pageError);
            }
          }
          
          if (pages.length > 0) {
            setPdfPages(pages);
            setBackgroundImage(null);
            setUploadProgress(100);
            setIsUploading(false);
            setUploadProgress(0);
            
            alert(`✅ Đã tải PDF thành công (chế độ tương thích): ${file.name}\nHiển thị ${pages.length}/${pdf.numPages} trang - Bạn có thể scroll để xem và vẽ trên tài liệu.`);
            
            setTimeout(() => {
              redrawBackground();
              redrawCanvas();
            }, 100);
            
            // Restore worker setting
            pdfjsLib.GlobalWorkerOptions.workerSrc = originalWorkerSrc;
            return;
          }
          
          // Restore worker setting
          pdfjsLib.GlobalWorkerOptions.workerSrc = originalWorkerSrc;
        } catch (fallbackError) {
          console.error('Fallback PDF loading also failed:', fallbackError);
        }
      }
      
      setIsUploading(false);
      setUploadProgress(0);
      
      let errorMessage = 'Lỗi khi tải PDF. ';
      
      if (error.message?.includes('Invalid PDF')) {
        errorMessage += 'File không phải là PDF hợp lệ.';
      } else if (error.message?.includes('quá lớn')) {
        errorMessage += error.message;
      } else if (error.message?.includes('network') || error.message?.includes('fetch')) {
        errorMessage += 'Lỗi kết nối mạng hoặc tải worker. Đang thử phương án khác...';
      } else if (error.message?.includes('render')) {
        errorMessage += 'Không thể hiển thị nội dung PDF.';
      } else if (error.message?.includes('worker')) {
        errorMessage += 'Lỗi PDF worker. Đang thử phương án khác...';
      } else {
        errorMessage += 'Vui lòng thử lại hoặc chọn file PDF khác.';
      }
      
      console.log('Final error message:', errorMessage);
      console.log('Error details:', error.message || error.toString());
      
      // Fallback: Create a simple PDF placeholder
      try {
        console.log('Creating PDF fallback placeholder...');
        await createPDFPlaceholder(file);
      } catch (fallbackError) {
        console.error('Fallback also failed:', fallbackError);
        alert(errorMessage + '\n\nChi tiết lỗi: ' + (error.message || error.toString()));
      }
    }
  };

  // Convert PDF to images using alternative method
  const createPDFPlaceholder = async (file: File) => {
    try {
      console.log('Attempting PDF to image conversion...');
      setUploadProgress(20);
      
      // Try to use PDF.js without worker for image conversion
      const arrayBuffer = await file.arrayBuffer();
      setUploadProgress(40);
      
      // Disable worker completely for this attempt
      const originalWorkerSrc = pdfjsLib.GlobalWorkerOptions.workerSrc;
      pdfjsLib.GlobalWorkerOptions.workerSrc = '';
      
      try {
        const loadingTask = pdfjsLib.getDocument({
          data: arrayBuffer,
          verbosity: 0,
          useWorkerFetch: false,
          isEvalSupported: false
        });
        
        const pdf = await loadingTask.promise;
        console.log('PDF loaded for image conversion, pages:', pdf.numPages);
        setUploadProgress(60);
        
        const images: HTMLImageElement[] = [];
        const maxPages = Math.min(pdf.numPages, 15); // Limit to 15 pages for performance
        
        for (let pageNum = 1; pageNum <= maxPages; pageNum++) {
          try {
            console.log(`Converting page ${pageNum} to image...`);
            const page = await pdf.getPage(pageNum);
            
            // Use smaller scale for better performance
            const viewport = page.getViewport({ scale: 1.5 });
            
            // Create canvas for this page
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            canvas.width = viewport.width;
            canvas.height = viewport.height;
            
            if (ctx) {
              // Set white background
              ctx.fillStyle = '#ffffff';
              ctx.fillRect(0, 0, canvas.width, canvas.height);
              
              // Render page to canvas
              await page.render({
                canvasContext: ctx,
                viewport: viewport,
                canvas: canvas
              }).promise;
              
              // Convert canvas to image
              const img = new Image();
              await new Promise<void>((resolve) => {
                img.onload = () => resolve();
                img.src = canvas.toDataURL('image/jpeg', 0.8);
              });
              
              images.push(img);
              console.log(`Page ${pageNum} converted successfully`);
            }
            
            setUploadProgress(60 + (pageNum / maxPages) * 30);
          } catch (pageError) {
            console.error(`Error converting page ${pageNum}:`, pageError);
            // Create a placeholder for failed page
            const placeholderImg = await createPagePlaceholder(pageNum, file.name);
            images.push(placeholderImg);
          }
        }
        
        // Restore worker setting
        pdfjsLib.GlobalWorkerOptions.workerSrc = originalWorkerSrc;
        
        if (images.length > 0) {
          // Create a combined canvas with all pages
          const combinedCanvas = document.createElement('canvas');
          const combinedCtx = combinedCanvas.getContext('2d');
          
          // Calculate total height
          const pageSpacing = 20;
          const maxWidth = Math.max(...images.map(img => img.width));
          const totalHeight = images.reduce((sum, img) => sum + img.height, 0) + (images.length - 1) * pageSpacing;
          
          combinedCanvas.width = maxWidth;
          combinedCanvas.height = totalHeight;
          
          if (combinedCtx) {
            // Set white background
            combinedCtx.fillStyle = '#ffffff';
            combinedCtx.fillRect(0, 0, combinedCanvas.width, combinedCanvas.height);
            
            // Draw all pages
            let yOffset = 0;
            images.forEach((img, index) => {
              const x = (maxWidth - img.width) / 2; // Center the page
              combinedCtx.drawImage(img, x, yOffset);
              yOffset += img.height + pageSpacing;
              
              // Add page separator
              if (index < images.length - 1) {
                combinedCtx.strokeStyle = '#e0e0e0';
                combinedCtx.lineWidth = 1;
                combinedCtx.beginPath();
                combinedCtx.moveTo(50, yOffset - pageSpacing / 2);
                combinedCtx.lineTo(maxWidth - 50, yOffset - pageSpacing / 2);
                combinedCtx.stroke();
              }
            });
            
            // Convert combined canvas to image
            const finalImg = new Image();
            finalImg.onload = () => {
              setBackgroundImage(finalImg);
              setIsUploading(false);
              setUploadProgress(0);
              
              const message = pdf.numPages > maxPages 
                ? `✅ Đã chuyển PDF thành ảnh: ${file.name}\nHiển thị ${maxPages}/${pdf.numPages} trang đầu tiên - Scroll để xem tất cả nội dung.`
                : `✅ Đã chuyển PDF thành ảnh: ${file.name}\n${pdf.numPages} trang - Scroll để xem tất cả nội dung và vẽ trên tài liệu.`;
              
              alert(message);
              
              setTimeout(() => {
                redrawBackground();
                redrawCanvas();
              }, 100);
            };
            finalImg.src = combinedCanvas.toDataURL('image/jpeg', 0.8);
            return;
          }
        }
        
        // Restore worker setting
        pdfjsLib.GlobalWorkerOptions.workerSrc = originalWorkerSrc;
        
      } catch (conversionError) {
        console.error('PDF to image conversion failed:', conversionError);
        // Restore worker setting
        pdfjsLib.GlobalWorkerOptions.workerSrc = originalWorkerSrc;
      }
      
      // If conversion fails, create simple placeholder
      await createSimplePlaceholder(file);
      
    } catch (error) {
      console.error('PDF placeholder creation failed:', error);
      await createSimplePlaceholder(file);
    }
  };

  // Create a placeholder for a single page
  const createPagePlaceholder = async (pageNum: number, fileName: string): Promise<HTMLImageElement> => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = 600;
    canvas.height = 800;
    
    if (ctx) {
      // White background
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Border
      ctx.strokeStyle = '#cccccc';
      ctx.lineWidth = 2;
      ctx.strokeRect(0, 0, canvas.width, canvas.height);
      
      // Page info
      ctx.fillStyle = '#666666';
      ctx.font = 'bold 24px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(`Trang ${pageNum}`, canvas.width / 2, 100);
      
      ctx.font = '16px Arial';
      ctx.fillText('Không thể hiển thị nội dung trang này', canvas.width / 2, 150);
      ctx.fillText('Bạn vẫn có thể vẽ trên trang này', canvas.width / 2, 180);
    }
    
    const img = new Image();
    await new Promise<void>((resolve) => {
      img.onload = () => resolve();
      img.src = canvas.toDataURL();
    });
    
    return img;
  };

  // Handle document load from DocumentLoader
  const handleDocumentLoad = useCallback(async (imageUrls: string[]) => {
    try {
      setIsUploading(true);
      setUploadProgress(20);
      
      // Clear existing background
      setBackgroundImage(null);
      setPdfPages([]);
      
      // Load all images
      const loadedImages: HTMLImageElement[] = [];
      
      for (let i = 0; i < imageUrls.length; i++) {
        const img = new Image();
        img.crossOrigin = 'anonymous'; // Handle CORS
        
        await new Promise<void>((resolve, reject) => {
          img.onload = () => {
            loadedImages.push(img);
            setUploadProgress(20 + (i / imageUrls.length) * 70);
            resolve();
          };
          img.onerror = () => {
            console.error(`Failed to load image: ${imageUrls[i]}`);
            reject(new Error(`Failed to load image ${i + 1}`));
          };
          img.src = imageUrls[i];
        });
      }
      
      if (loadedImages.length > 0) {
        // Create combined canvas with all pages
        const combinedCanvas = document.createElement('canvas');
        const combinedCtx = combinedCanvas.getContext('2d');
        
        if (combinedCtx) {
          // Calculate total dimensions
          const pageSpacing = 20;
          const maxWidth = Math.max(...loadedImages.map(img => img.width));
          const totalHeight = loadedImages.reduce((sum, img) => sum + img.height, 0) + 
                             (loadedImages.length - 1) * pageSpacing;
          
          combinedCanvas.width = maxWidth;
          combinedCanvas.height = totalHeight;
          
          // Set white background
          combinedCtx.fillStyle = '#ffffff';
          combinedCtx.fillRect(0, 0, combinedCanvas.width, combinedCanvas.height);
          
          // Draw all pages
          let yOffset = 0;
          loadedImages.forEach((img, index) => {
            const x = (maxWidth - img.width) / 2; // Center the page
            combinedCtx.drawImage(img, x, yOffset);
            yOffset += img.height + pageSpacing;
            
            // Add page separator
            if (index < loadedImages.length - 1) {
              combinedCtx.strokeStyle = '#e0e0e0';
              combinedCtx.lineWidth = 1;
              combinedCtx.beginPath();
              combinedCtx.moveTo(50, yOffset - pageSpacing / 2);
              combinedCtx.lineTo(maxWidth - 50, yOffset - pageSpacing / 2);
              combinedCtx.stroke();
            }
          });
          
          // Convert to image and set as background
          const finalImg = new Image();
          finalImg.onload = () => {
            setBackgroundImage(finalImg);
            setLoadedImageUrls(imageUrls);
            setUploadProgress(100);
            setIsUploading(false);
            setUploadProgress(0);
            
            // Force redraw
            setTimeout(() => {
              redrawBackground();
              redrawCanvas();
            }, 100);
          };
          finalImg.src = combinedCanvas.toDataURL('image/jpeg', 0.9);
        }
      }
      
    } catch (error) {
      console.error('Error loading document images:', error);
      setIsUploading(false);
      setUploadProgress(0);
      alert('Lỗi khi tải tài liệu: ' + (error as Error).message);
    }
  }, [redrawBackground, redrawCanvas]);

  // Create simple placeholder when all else fails
  const createSimplePlaceholder = async (file: File) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = 800;
    canvas.height = 1000;
    
    if (ctx) {
      // Create a PDF placeholder
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Add border
      ctx.strokeStyle = '#cccccc';
      ctx.lineWidth = 2;
      ctx.strokeRect(0, 0, canvas.width, canvas.height);
      
      // Add PDF icon and info
      ctx.fillStyle = '#dc3545';
      ctx.font = 'bold 48px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('📄', canvas.width / 2, 200);
      
      ctx.fillStyle = '#000000';
      ctx.font = 'bold 24px Arial';
      ctx.fillText('PDF Document', canvas.width / 2, 280);
      
      ctx.font = '18px Arial';
      ctx.fillStyle = '#666666';
      const fileName = file.name.length > 40 ? file.name.substring(0, 37) + '...' : file.name;
      ctx.fillText(fileName, canvas.width / 2, 320);
      
      const fileSize = (file.size / 1024 / 1024).toFixed(2);
      ctx.fillText(`Kích thước: ${fileSize} MB`, canvas.width / 2, 350);
      
      ctx.fillStyle = '#333333';
      ctx.font = '16px Arial';
      ctx.fillText('Không thể chuyển đổi PDF', canvas.width / 2, 400);
      ctx.fillText('Bạn vẫn có thể vẽ trên tài liệu này', canvas.width / 2, 430);
      
      // Convert to image and set as background
      const img = new Image();
      img.onload = () => {
        setBackgroundImage(img);
        setIsUploading(false);
        setUploadProgress(0);
        alert(`⚠️ Đã tải PDF với chế độ cơ bản: ${file.name}\nKhông thể hiển thị nội dung, nhưng bạn vẫn có thể vẽ trên tài liệu.`);
        
        setTimeout(() => {
          redrawBackground();
          redrawCanvas();
        }, 100);
      };
      img.src = canvas.toDataURL();
    }
  };

  // Handle file upload
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setUploadProgress(10);

    try {
      if (file.type === 'application/pdf') {
        await handlePDFUpload(file);
        return;
      }

      // Handle image files
      if (file.type.startsWith('image/')) {
        setUploadProgress(30);
        
        // Resize image for better performance
        const resizedDataUrl = await resizeImage(file);
        setUploadProgress(70);
        
        const img = new Image();
        img.onload = () => {
          setBackgroundImage(img);
          setIsUploading(false);
          setUploadProgress(0);
          
          // Show success message
          alert(`✅ Đã tải thành công: ${file.name}`);
          
          // Force redraw after image loads
          setTimeout(() => {
            redrawBackground();
            redrawCanvas();
          }, 50);
        };
        
        img.onerror = () => {
          setIsUploading(false);
          setUploadProgress(0);
          alert('Lỗi khi tải ảnh. Vui lòng thử lại.');
        };
        
        img.src = resizedDataUrl;
        setUploadProgress(90);
      } else {
        setIsUploading(false);
        setUploadProgress(0);
        alert('Định dạng file không được hỗ trợ. Vui lòng chọn file ảnh hoặc PDF.');
      }
    } catch (error) {
      console.error('File upload error:', error);
      setIsUploading(false);
      setUploadProgress(0);
      alert('Lỗi khi tải file. Vui lòng thử lại.');
    }
    
    // Reset file input
    e.target.value = '';
  };

  // Mouse event handlers
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const pos = getMousePos(e);
    setStartPoint(pos);

    switch (currentTool) {
      case 'pen':
        setIsDrawing(true);
        setCurrentPath([pos]);
        break;

      case 'text':
        setIsTyping(true);
        setTextPosition(pos);
        setTextInput('');
        break;

      case 'eraser':
        setIsDrawing(true);
        // Erase elements at this position
        eraseAtPosition(pos);
        break;

      case 'rectangle':
      case 'circle':
      case 'triangle':
      case 'line':
        setIsDrawing(true);
        break;
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;

    const pos = getMousePos(e);

    if (currentTool === 'pen') {
      setCurrentPath(prev => [...prev, pos]);
    } else if (currentTool === 'eraser') {
      eraseAtPosition(pos);
    }
  };

  const handleMouseUp = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !startPoint) return;

    const pos = getMousePos(e);

    switch (currentTool) {
      case 'pen':
        if (currentPath.length > 1) {
          const newElement: DrawingElement = {
            id: Date.now().toString(),
            type: 'pen',
            points: [...currentPath],
            color: penColor,
            size: penSize,
            timestamp: Date.now()
          };
          setElements(prev => [...prev, newElement]);
          saveToHistory();
        }
        break;

      case 'rectangle':
      case 'circle':
      case 'triangle':
        const newShape: DrawingElement = {
          id: Date.now().toString(),
          type: 'shape',
          shapeType: currentTool,
          position: {
            x: Math.min(startPoint.x, pos.x),
            y: Math.min(startPoint.y, pos.y)
          },
          width: Math.abs(pos.x - startPoint.x),
          height: Math.abs(pos.y - startPoint.y),
          color: penColor,
          size: penSize,
          timestamp: Date.now()
        };
        setElements(prev => [...prev, newShape]);
        saveToHistory();
        break;

      case 'line':
        const newLine: DrawingElement = {
          id: Date.now().toString(),
          type: 'line',
          points: [startPoint, pos],
          color: penColor,
          size: penSize,
          timestamp: Date.now()
        };
        setElements(prev => [...prev, newLine]);
        saveToHistory();
        break;

      case 'eraser':
        saveToHistory();
        break;
    }

    setIsDrawing(false);
    setCurrentPath([]);
    setStartPoint(null);
  };

  // Handle text input completion
  const handleTextComplete = () => {
    if (textInput.trim() && textPosition) {
      const newElement: DrawingElement = {
        id: Date.now().toString(),
        type: 'text',
        text: textInput,
        position: textPosition,
        color: penColor,
        size: penSize,
        timestamp: Date.now()
      };
      setElements(prev => [...prev, newElement]);
      saveToHistory();
    }
    setIsTyping(false);
    setTextInput('');
    setTextPosition(null);
  };

  // Toolbar actions
  const handleUndo = () => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1);
      setElements(history[historyIndex - 1]);
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(historyIndex + 1);
      setElements(history[historyIndex + 1]);
    }
  };

  const handleClear = () => {
    if (window.confirm('Bạn có chắc chắn muốn xóa tất cả?')) {
      setElements([]);
      setBackgroundImage(null);
      setPdfPages([]);
      setPdfDocument(null);
      setTotalPages(0);
      setCurrentPage(1);
      saveToHistory();
    }
  };

  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev * 1.2, 3));
  };

  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev / 1.2, 0.5));
  };

  const handleResetView = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  const tools = [
    { id: 'pen' as const, icon: Pen, label: 'Bút vẽ' },
    { id: 'text' as const, icon: Type, label: 'Văn bản' },
    { id: 'line' as const, icon: Minus, label: 'Đường thẳng' },
    { id: 'rectangle' as const, icon: Square, label: 'Hình chữ nhật' },
    { id: 'circle' as const, icon: Circle, label: 'Hình tròn' },
    { id: 'triangle' as const, icon: Triangle, label: 'Tam giác' },
    { id: 'eraser' as const, icon: Eraser, label: 'Tẩy' },
  ];

  const colors = [
    '#000000', '#ffffff', '#ff0000', '#00ff00', '#0000ff', 
    '#ffff00', '#ff00ff', '#00ffff', '#ffa500', '#800080'
  ];

  return (
    <div className="h-screen bg-gray-100 flex flex-col">
      {/* Header */}
      <header className="bg-white shadow-sm border-b p-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-800">🎨 Bảng Trắng Tương Tác</h1>
          
          <div className="flex items-center space-x-2">
            {/* PDF Navigation */}
            {totalPages > 0 && (
              <div className="flex items-center space-x-2 px-3 py-2 bg-gray-100 rounded">
                <span className="text-sm font-medium">PDF:</span>
                <span className="text-sm">{totalPages} trang</span>
                <div className="text-xs text-gray-600">Scroll để xem tất cả</div>
              </div>
            )}
            
            <button
              onClick={() => setShowDocumentLoader(true)}
              disabled={isUploading || !classId}
              className={`flex items-center space-x-2 px-3 py-2 rounded transition-colors ${
                isUploading || !classId
                  ? 'bg-gray-400 text-white cursor-not-allowed' 
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
              title={!classId ? 'Cần có ID lớp học để tải tài liệu' : 'Tải tài liệu từ hệ thống'}
            >
              {isUploading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Đang tải... {uploadProgress}%</span>
                </>
              ) : (
                <>
                  <FolderOpen className="h-4 w-4" />
                  <span>Tải tài liệu</span>
                </>
              )}
            </button>
            
            <button
              onClick={() => setShowVideoConference(!showVideoConference)}
              className={`flex items-center space-x-2 px-3 py-2 rounded transition-colors ${
                showVideoConference
                  ? 'bg-green-600 text-white hover:bg-green-700'
                  : 'bg-purple-600 text-white hover:bg-purple-700'
              }`}
              title={showVideoConference ? 'Ẩn video conference' : 'Hiển thị video conference'}
            >
              {showVideoConference ? (
                <>
                  <VideoOff className="h-4 w-4" />
                  <span>Ẩn Video</span>
                </>
              ) : (
                <>
                  <Video className="h-4 w-4" />
                  <span>Video Call</span>
                </>
              )}
            </button>
            
            <button
              onClick={handleClear}
              className="flex items-center space-x-2 px-3 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            >
              <Trash2 className="h-4 w-4" />
              <span>Xóa tất cả</span>
            </button>
          </div>
        </div>
      </header>

      {/* Toolbar */}
      <div className="bg-white border-b p-4">
        <div className="flex items-center justify-between">
          {/* Tools */}
          <div className="flex items-center space-x-2">
            {tools.map((tool) => (
              <button
                key={tool.id}
                onClick={() => setCurrentTool(tool.id)}
                className={`p-2 rounded transition-colors ${
                  currentTool === tool.id 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
                title={tool.label}
              >
                <tool.icon className="h-5 w-5" />
              </button>
            ))}
            
            <div className="w-px h-8 bg-gray-300 mx-2" />
            
            {/* History */}
            <button
              onClick={handleUndo}
              disabled={historyIndex <= 0}
              className="p-2 rounded bg-gray-200 text-gray-700 hover:bg-gray-300 disabled:opacity-50"
              title="Hoàn tác"
            >
              <Undo className="h-5 w-5" />
            </button>
            
            <button
              onClick={handleRedo}
              disabled={historyIndex >= history.length - 1}
              className="p-2 rounded bg-gray-200 text-gray-700 hover:bg-gray-300 disabled:opacity-50"
              title="Làm lại"
            >
              <Redo className="h-5 w-5" />
            </button>
          </div>

          {/* Colors and Size */}
          <div className="flex items-center space-x-4">
            {/* Colors */}
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium">Màu:</span>
              <div className="flex space-x-1">
                {colors.map((color) => (
                  <button
                    key={color}
                    onClick={() => setPenColor(color)}
                    className={`w-8 h-8 rounded border-2 ${
                      penColor === color ? 'border-gray-800' : 'border-gray-300'
                    }`}
                    style={{ backgroundColor: color }}
                    title={`Chọn màu ${color}`}
                  />
                ))}
              </div>
            </div>

            {/* Size */}
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium">Cỡ:</span>
              <input
                type="range"
                min="1"
                max="20"
                value={penSize}
                onChange={(e) => setPenSize(Number(e.target.value))}
                className="w-20"
              />
              <span className="text-sm w-8">{penSize}px</span>
            </div>

            {/* Zoom */}
            <div className="flex items-center space-x-2">
              <button
                onClick={handleZoomOut}
                className="p-1 rounded bg-gray-200 hover:bg-gray-300"
                title="Thu nhỏ"
              >
                <ZoomOut className="h-4 w-4" />
              </button>
              
              <span className="text-sm w-12 text-center">{Math.round(zoom * 100)}%</span>
              
              <button
                onClick={handleZoomIn}
                className="p-1 rounded bg-gray-200 hover:bg-gray-300"
                title="Phóng to"
              >
                <ZoomIn className="h-4 w-4" />
              </button>
              
              <button
                onClick={handleResetView}
                className="p-1 rounded bg-gray-200 hover:bg-gray-300"
                title="Đặt lại view"
              >
                <RotateCcw className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Canvas Area */}
        <div className={`relative overflow-hidden ${showVideoConference ? 'flex-1' : 'w-full'}`}>
          <canvas
            ref={backgroundCanvasRef}
            className="absolute inset-0 w-full h-full"
          />
          <canvas
            ref={canvasRef}
            className="absolute inset-0 w-full h-full cursor-crosshair"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
          />
        
          {/* Text Input Box */}
          {isTyping && textPosition && (
            <div
              className="absolute bg-white border-2 border-blue-500 rounded shadow-lg"
              style={{
                left: textPosition.x * zoom + pan.x * zoom,
                top: textPosition.y * zoom + pan.y * zoom,
                zIndex: 1000
              }}
            >
              <input
                type="text"
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleTextComplete();
                  } else if (e.key === 'Escape') {
                    setIsTyping(false);
                    setTextInput('');
                    setTextPosition(null);
                  }
                }}
                onBlur={handleTextComplete}
                autoFocus
                className="px-2 py-1 border-none outline-none"
                style={{
                  fontSize: `${penSize + 12}px`,
                  color: penColor,
                  minWidth: '100px'
                }}
                placeholder="Nhập văn bản..."
              />
            </div>
          )}
        </div>

        {/* Video Conference Area */}
        {showVideoConference && (
          <div className="w-96 border-l border-gray-300 bg-gray-50">
            <VideoConference
              roomName={classId || 'default'}
              userName={user?.full_name || 'Guest'}
              userRole={user?.role || 'student'}
              onLeave={() => setShowVideoConference(false)}
            />
          </div>
        )}
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*,.pdf,.doc,.docx,.ppt,.pptx"
        onChange={handleFileUpload}
        className="hidden"
      />

      {/* Document Loader Modal */}
      {showDocumentLoader && classId && (
        <DocumentLoader
          classId={parseInt(classId)}
          onDocumentLoad={handleDocumentLoad}
          onClose={() => setShowDocumentLoader(false)}
        />
      )}
    </div>
  );
};

export default WhiteboardPage;
