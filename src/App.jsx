
import CanvasSketchpad from './components/PixelCanvas';
import './App.css';

function App() {
  return (
    <div className="App">
      <h1>🖌️ Canvas Pixel Sketchpad</h1>
      <CanvasSketchpad width={320} height={320} pixelSize={20} />
    </div>
  );
}

export default App;