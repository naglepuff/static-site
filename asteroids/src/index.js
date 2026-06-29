import { AsteroidsGame } from "./asteroidsGame";

const canvas = document.getElementById("canvas");
const game = new AsteroidsGame(canvas);
game.beginGame();
