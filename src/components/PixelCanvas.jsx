import React, { useRef, useState, useEffect } from 'react';
import './PixelCanvas.css';

const CanvasSketchpad = ({ width = 320, height = 320, pixelSize = 20 }) => {
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [color, setColor] = useState('#000000');
  const [history, setHistory] = useState([]);
  const [currentStep, setCurrentStep] = useState(-1);
  const [currentPixelSize, setCurrentPixelSize] = useState(pixelSize);

  const cols = width / currentPixelSize;
  const rows = height / currentPixelSize;

  useEffect(() => {
    initializeCanvas();
  }, [width, height, currentPixelSize]);

  const initializeCanvas = () => {
    const canvas = canvasRef.current;
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, width, height);

    drawGrid(ctx);
    saveCanvasState();
  };

  const drawGrid = (ctx) => {
    ctx.strokeStyle = '#ccc';
    for (let x = 0; x <= width; x += currentPixelSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    for (let y = 0; y <= height; y += currentPixelSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }
  };

  const saveCanvasState = () => {
    const canvas = canvasRef.current;
    const dataUrl = canvas.toDataURL();
    const newHistory = history.slice(0, currentStep + 1);
    newHistory.push(dataUrl);
    setHistory(newHistory);
    setCurrentStep(newHistory.length - 1);
  };

  const drawPixel = (x, y) => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const col = Math.floor(x / currentPixelSize);
    const row = Math.floor(y / currentPixelSize);
    ctx.fillStyle = color;
    ctx.fillRect(col * currentPixelSize, row * currentPixelSize, currentPixelSize, currentPixelSize);
    ctx.strokeStyle = '#ccc';
    ctx.strokeRect(col * currentPixelSize, row * currentPixelSize, currentPixelSize, currentPixelSize);
  };

  const handleMouseDown = (e) => {
    setIsDrawing(true);
    const rect = canvasRef.current.getBoundingClientRect();
    drawPixel(e.clientX - rect.left, e.clientY - rect.top);
  };

  const handleMouseMove = (e) => {
    if (!isDrawing) return;
    const rect = canvasRef.current.getBoundingClientRect();
    drawPixel(e.clientX - rect.left, e.clientY - rect.top);
  };

  const handleMouseUp = () => {
    setIsDrawing(false);
    saveCanvasState();
  };

  const handleTouch = (e, drawFunc) => {
    const rect = canvasRef.current.getBoundingClientRect();
    const touch = e.touches[0];
    drawFunc({ clientX: touch.clientX, clientY: touch.clientY });
  };

  const clearCanvas = () => {
    initializeCanvas();
  };

  const undo = () => {
    if (currentStep > 0) {
      const newStep = currentStep - 1;
      const img = new Image();
      img.src = history[newStep];
      img.onload = () => {
        const ctx = canvasRef.current.getContext('2d');
        ctx.clearRect(0, 0, width, height);
        ctx.drawImage(img, 0, 0);
        drawGrid(ctx);
        setCurrentStep(newStep);
      };
    }
  };

  const redo = () => {
    if (currentStep < history.length - 1) {
      const newStep = currentStep + 1;
      const img = new Image();
      img.src = history[newStep];
      img.onload = () => {
        const ctx = canvasRef.current.getContext('2d');
        ctx.clearRect(0, 0, width, height);
        ctx.drawImage(img, 0, 0);
        drawGrid(ctx);
        setCurrentStep(newStep);
      };
    }
  };

  const downloadImage = () => {
    const link = document.createElement('a');
    link.download = 'sketch.png';
    link.href = canvasRef.current.toDataURL();
    link.click();
  };

  return (
    <div className="sketch-container">
      <div className="toolbar">
        <label>
          Color:
          <input type="color" value={color} onChange={(e) => setColor(e.target.value)} />
        </label>
        <label>
          Pixel Size:
          <input
            type="number"
            min="5"
            max="50"
            value={currentPixelSize}
            onChange={(e) => setCurrentPixelSize(Number(e.target.value))}
          />
        </label>
        <button onClick={undo}>Undo</button>
        <button onClick={redo}>Redo</button>
        <button onClick={clearCanvas}>Clear</button>
        <button onClick={downloadImage}>Download</button>
      </div>
      <canvas
        ref={canvasRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onTouchStart={(e) => handleTouch(e, handleMouseDown)}
        onTouchMove={(e) => handleTouch(e, handleMouseMove)}
        onTouchEnd={handleMouseUp}
        className="drawing-canvas"
      ></canvas>
    </div>
  );
};

export default CanvasSketchpad;

