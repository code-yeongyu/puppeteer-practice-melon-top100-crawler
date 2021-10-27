export interface Song {
  title: string;
  artist: string;
  album: string;
}

export interface RankedSong {
  rank: number;
  song: Song;
}
