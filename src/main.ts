import './style.css';
import { GameController } from './ui/GameController';

const canvas = document.getElementById('game-canvas') as HTMLCanvasElement;
new GameController(canvas);
