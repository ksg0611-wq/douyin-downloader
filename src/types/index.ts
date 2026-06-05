export interface VideoMock {
  id: string;
  url: string;
  title: string;
  creatorName: string;
  creatorAvatar: string;
  thumbnail: string;
  resolution: string;
  duration: string;
  fileSize: string;
  audioSize: string;
  likes: string;
  comments: string;
  shares: string;
  realVideoUrl?: string;
  realAudioUrl?: string;
}

export interface DownloadHistory {
  id: string;
  url: string;
  title: string;
  creatorName: string;
  thumbnail: string;
  downloadedAt: string;
  videoData?: VideoMock;
}
