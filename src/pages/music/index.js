import { mockSongs } from "@/data/data";
import { useState, useRef, useEffect } from "react";

export default function MusicPage() {
  const [currentSongId, setCurrentSongId] = useState(mockSongs.find(song => song.isPlaying)?.id || mockSongs[0].id);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.75);
  const [isMuted, setIsMuted] = useState(false);
  const audioRef = useRef(null);
  
  const currentSong = mockSongs.find(song => song.id === currentSongId) || mockSongs[0];

  useEffect(() => {
    const audio = audioRef.current;
    if (audio) {
      const updateTime = () => setCurrentTime(audio.currentTime);
      const updateDuration = () => setDuration(audio.duration);
      
      audio.addEventListener('timeupdate', updateTime);
      audio.addEventListener('loadedmetadata', updateDuration);
      audio.addEventListener('ended', handleNext);
      
      return () => {
        audio.removeEventListener('timeupdate', updateTime);
        audio.removeEventListener('loadedmetadata', updateDuration);
        audio.removeEventListener('ended', handleNext);
      };
    }
  }, [currentSongId]);

  const handleSongClick = (songId) => {
    setCurrentSongId(songId);
    setIsPlaying(true);
  };

  const handlePlayPause = () => {
    const audio = audioRef.current;
    if (isPlaying) {
      audio.pause();
    } else {
      audio.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handlePrevious = () => {
    const currentIndex = mockSongs.findIndex(song => song.id === currentSongId);
    const previousIndex = currentIndex > 0 ? currentIndex - 1 : mockSongs.length - 1;
    setCurrentSongId(mockSongs[previousIndex].id);
    setIsPlaying(true);
  };

  const handleNext = () => {
    const currentIndex = mockSongs.findIndex(song => song.id === currentSongId);
    const nextIndex = currentIndex < mockSongs.length - 1 ? currentIndex + 1 : 0;
    setCurrentSongId(mockSongs[nextIndex].id);
    setIsPlaying(true);
  };

  const handleProgressClick = (e) => {
    const audio = audioRef.current;
    const progressBar = e.currentTarget;
    const clickX = e.nativeEvent.offsetX;
    const width = progressBar.offsetWidth;
    const newTime = (clickX / width) * duration;
    audio.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const formatTime = (time) => {
    if (isNaN(time)) return "0:00";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    const audio = audioRef.current;
    if (audio && currentSong.sources && currentSong.sources[0]) {
      audio.src = currentSong.sources[0].src;
      audio.volume = isMuted ? 0 : volume;
      audio.load(); // Force load the audio
      
      if (isPlaying) {
        const playPromise = audio.play();
        if (playPromise !== undefined) {
          playPromise.catch(error => {
            console.error("Audio play failed:", error);
            setIsPlaying(false);
          });
        }
      }
    }
  }, [currentSongId]);

  useEffect(() => {
    const audio = audioRef.current;
    if (audio) {
      if (isPlaying) {
        const playPromise = audio.play();
        if (playPromise !== undefined) {
          playPromise.catch(error => {
            console.error("Audio play failed:", error);
            setIsPlaying(false);
          });
        }
      } else {
        audio.pause();
      }
    }
  }, [isPlaying]);

  const handleVolumeClick = (e) => {
    const audio = audioRef.current;
    const volumeBar = e.currentTarget;
    const clickX = e.nativeEvent.offsetX;
    const width = volumeBar.offsetWidth;
    const newVolume = clickX / width;
    setVolume(newVolume);
    setIsMuted(false);
    if (audio) {
      audio.volume = newVolume;
    }
  };

  const handleMuteToggle = () => {
    const audio = audioRef.current;
    if (audio) {
      if (isMuted) {
        audio.volume = volume;
        setIsMuted(false);
      } else {
        audio.volume = 0;
        setIsMuted(true);
      }
    }
  };

  // Update audio volume when volume changes
  useEffect(() => {
    const audio = audioRef.current;
    if (audio) {
      audio.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-900 to-black text-white flex flex-col">
      <audio ref={audioRef} />
      
      <div className="flex-1">
        {/* Header */}
        <div className="flex items-center justify-between p-6 bg-black bg-opacity-50">
          <div className="flex items-center space-x-4">
            <button className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center hover:bg-green-400">
              <svg className="w-6 h-6 text-black" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z"/>
              </svg>
            </button>
            <button className="w-8 h-8 border-2 border-gray-400 rounded-full flex items-center justify-center hover:border-white">
              <span className="text-gray-400 text-xl">+</span>
            </button>
          </div>
          
          <div className="flex items-center space-x-4">
            <span className="text-gray-300">List</span>
            <svg className="w-5 h-5 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </div>
        </div>

        {/* Table Header */}
        <div className="px-6 py-4">
          <div className="grid grid-cols-12 gap-4 text-gray-400 text-sm border-b border-gray-800 pb-2">
            <div className="col-span-1">#</div>
            <div className="col-span-6">Title</div>
            <div className="col-span-4">Album</div>
            <div className="col-span-1 text-right">
              <svg className="w-4 h-4 ml-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Songs List */}
        <div className="px-6">
          {mockSongs && mockSongs.map((song, index) => (
            <div 
              key={song.id} 
              className={`grid grid-cols-12 gap-4 py-3 hover:bg-white hover:bg-opacity-10 rounded-lg px-2 group cursor-pointer ${
                currentSongId === song.id ? 'bg-white bg-opacity-5' : ''
              }`}
              onClick={() => handleSongClick(song.id)}
            >
              {/* Track Number */}
              <div className="col-span-1 flex items-center">
                {currentSongId === song.id ? (
                  <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z"/>
                  </svg>
                ) : (
                  <>
                    <span className="text-gray-400 group-hover:hidden">{index + 1}</span>
                    <svg className="w-4 h-4 text-white hidden group-hover:block" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z"/>
                    </svg>
                  </>
                )}
              </div>

              {/* Song Info */}
              <div className="col-span-6 flex items-center space-x-3">
                <img 
                  src={song.albumArt || "/api/placeholder/40/40"} 
                  alt={song.title}
                  className="w-10 h-10 rounded"
                />
                <div>
                  <div className={`font-medium ${currentSongId === song.id ? 'text-green-500' : 'text-white'}`}>
                    {song.title}
                  </div>
                  <div className="text-sm text-gray-400">{song.artist}</div>
                </div>
              </div>

              {/* Album */}
              <div className="col-span-4 flex items-center">
                <span className="text-gray-400 hover:text-white hover:underline cursor-pointer">
                  {song.album}
                </span>
              </div>

              {/* Duration */}
              <div className="col-span-1 flex items-center justify-end">
                <span className="text-gray-400 text-sm">{song.duration}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Music Player Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-gray-900 border-t border-gray-800 px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Left: Current Song Info */}
          <div className="flex items-center space-x-4 w-1/4">
            <img 
              src={currentSong.albumArt} 
              alt={currentSong.title}
              className="w-14 h-14 rounded"
            />
            <div className="min-w-0">
              <div className="text-white text-sm font-medium truncate">{currentSong.title}</div>
              <div className="text-gray-400 text-xs truncate">{currentSong.artist}</div>
            </div>
            <button className="text-gray-400 hover:text-white">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
              </svg>
            </button>
          </div>

          {/* Center: Player Controls */}
          <div className="flex flex-col items-center w-1/2 max-w-2xl">
            {/* Control Buttons */}
            <div className="flex items-center space-x-6 mb-2">
              <button className="text-gray-400 hover:text-white" onClick={handlePrevious}>
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M6 6h2v12H6zm3.5 6l8.5 6V6z"/>
                </svg>
              </button>
              <button 
                className="w-8 h-8 bg-white rounded-full flex items-center justify-center hover:scale-105 transition-transform"
                onClick={handlePlayPause}
              >
                {isPlaying ? (
                  <svg className="w-4 h-4 text-black" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>
                  </svg>
                ) : (
                  <svg className="w-4 h-4 text-black ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z"/>
                  </svg>
                )}
              </button>
              <button className="text-gray-400 hover:text-white" onClick={handleNext}>
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z"/>
                </svg>
              </button>
            </div>

            {/* Progress Bar */}
            <div className="flex items-center space-x-2 w-full">
              <span className="text-xs text-gray-400">{formatTime(currentTime)}</span>
              <div 
                className="flex-1 h-1 bg-gray-600 rounded-full cursor-pointer"
                onClick={handleProgressClick}
              >
                <div 
                  className="h-full bg-white rounded-full transition-all duration-100"
                  style={{ width: `${duration ? (currentTime / duration) * 100 : 0}%` }}
                ></div>
              </div>
              <span className="text-xs text-gray-400">{formatTime(duration)}</span>
            </div>
          </div>

          {/* Right: Volume and Other Controls */}
          <div className="flex items-center space-x-3 w-1/4 justify-end">
            <button 
              className="text-gray-400 hover:text-white"
              onClick={handleMuteToggle}
            >
              {isMuted || volume === 0 ? (
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5V4L9 9H5z"/>
                </svg>
              ) : volume < 0.5 ? (
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18.5 12c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM5 9v6h4l5 5V4L9 9H5z"/>
                </svg>
              ) : (
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>
                </svg>
              )}
            </button>
            <div 
              className="flex items-center space-x-2 cursor-pointer"
              onClick={handleVolumeClick}
            >
              <div className="w-16 h-1 bg-gray-600 rounded-full">
                <div 
                  className="h-full bg-white rounded-full transition-all duration-100"
                  style={{ width: `${isMuted ? 0 : volume * 100}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
