import { Piece, Item } from "./piece";
import { Sections } from "./section";

interface BoardConfig {
  height: number;
  width: number;
  speed: number;
  size: number;
  activeIndex: number;
}

export class Board {
  constructor(
    initPieces: Pick<Piece, "pos" | "item">[],
    public config: BoardConfig
  ) {
    this.createSections();
    for (let i = 0; i < initPieces.length; i++) {
      this.addPiece(
        new Piece(
          initPieces[i].pos,
          initPieces[i].item,
          config,
          this,
          this.sections
        )
      );
    }
  }

  pieces: Piece[] = [];
  piecesByType: Record<Item, Piece[]> = {
    0: [],
    1: [],
    2: [],
  };
  sections!: Sections;
  winner: Item | null = null;

  update() {
    this.pieces.forEach((v) => v.think());
    this.pieces.forEach((v) => v.move());
  }

  changeSize({ width, height }: { width: number; height: number }) {
    console.log("Change Size", { width, height });
    this.config.width = width;
    this.config.height = height;
    this.pieces.forEach((p) => p.ensureWithinBoarders());
    this.createSections();
  }

  createSections() {
    const divisions = Math.ceil(
      Math.sqrt(Math.max(this.config.height, this.config.width)) / 2
    );
    this.sections = new Sections(
      this.config.height,
      this.config.width,
      divisions
    );
    this.pieces.forEach((p) => {
      p.section = this.sections.add(p);
    });
  }
  addPiece(t: Piece) {
    this.pieces.push(t);
    this.piecesByType[t.item].push(t);
  }
  changeItem(piece: Piece, item: Item) {
    this.piecesByType[piece.item].splice(
      this.piecesByType[piece.item].indexOf(piece),
      1
    );
    piece.section.remove(piece);

    // If there are no more of the piece being taken, declare the taker is the winner
    if (this.piecesByType[piece.item].length === 0) {
      this.winner = item;
    }
    this.piecesByType[item].push(piece);
    piece.section.piecesByType[item].push(piece);
    piece.item = item;
  }
}
