import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/router';
import styles from './Player.module.css';

const Player = () => {
  const router = useRouter();
  const { track } = router.query;
  const trackData = track ? JSON.parse(track) : null;
  
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const audioRef = useRef(null);

  useEffect(() => {
    if (trackData) {
      const likedSongs = JSON.parse(localStorage.getItem('likedSongs') || '[]');
      setIsLiked(likedSongs.some(song => song.id === trackData.id));
    }
  }, [trackData]);

  const handlePlayPause = () => {
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleSeek = (e) => {
    const seekTime = (e.target.value / 100) * duration;
    audioRef.current.currentTime = seekTime;
    setProgress(e.target.value);
  };

  const handleLike = () => {
    if (trackData) {
      const likedSongs = JSON.parse(localStorage.getItem('likedSongs') || '[]');
      if (isLiked) {
        const updatedLikedSongs = likedSongs.filter(song => song.id !== trackData.id);
        localStorage.setItem('likedSongs', JSON.stringify(updatedLikedSongs));
        setIsLiked(false);
      } else {
        const newLikedSong = { ...trackData, date: new Date().toISOString() };
        localStorage.setItem('likedSongs', JSON.stringify([...likedSongs, newLikedSong]));
        setIsLiked(true);
      }
    }
  };

  useEffect(() => {
    const audio = audioRef.current;

    const updateProgress = () => {
      if (audio && audio.duration) {
        setCurrentTime(audio.currentTime);
        setProgress((audio.currentTime / audio.duration) * 100);
      }
    };

    const handleLoadedMetadata = () => {
      setDuration(audio.duration);
    };

    if (audio) {
      audio.addEventListener('timeupdate', updateProgress);
      audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    }

    return () => {
      if (audio) {
        audio.removeEventListener('timeupdate', updateProgress);
        audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      }
    };
  }, [trackData]);

  return (
    <div className={styles.playerWrapper}>
      <div className={styles.playerContainer}>
        {trackData ? (
          <>
            <div className={styles.trackName}>
              {trackData.name}
            </div>
            <div className={styles.playerControls}>
              <button className={styles.playButton} onClick={handlePlayPause}>
                {isPlaying ? '❚❚' : '▶'}
              </button>
              <input
                type="range"
                className={styles.seekBar}
                min="0"
                max="100"
                value={progress}
                onChange={handleSeek}
              />
              <span className={styles.time}>
                {Math.floor(currentTime)}s / {Math.floor(duration)}s
              </span>
              <button className={styles.likeButton} onClick={handleLike}>
                {isLiked ? '❤️' : '🤍'}
              </button>
              <audio ref={audioRef}>
                <source src={trackData.preview_url} type="audio/mpeg" />
                Your browser does not support the audio element.
              </audio>
            </div>
          </>
        ) : (
          <p className={styles.trackName}>No track selected</p>
        )}
      </div>
    </div>
  );
};

export default Player;