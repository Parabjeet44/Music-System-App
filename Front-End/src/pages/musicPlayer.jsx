import React, { useRef, useState, useEffect } from 'react';
import styles from './musicPlayer.module.css';

const MusicPlayer = ({ track }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [playbackFailed, setPlaybackFailed] = useState(false);
  const videoRef = useRef(null);

  useEffect(() => {
    const videoElement = videoRef.current;

    if (track && videoElement) {
      const handleMetadataLoad = () => {
        if (videoElement && videoElement.duration > 0) {
          setProgress((videoElement.currentTime / videoElement.duration) * 100);
        }
      };

      const handleTimeUpdate = () => {
        if (videoElement && videoElement.duration > 0) {
          setProgress((videoElement.currentTime / videoElement.duration) * 100);
        }
      };

      const handlePlay = () => {
        setIsPlaying(true);
        setPlaybackFailed(false);
      };

      const handlePause = () => {
        setIsPlaying(false);
      };

      const playVideo = () => {
        videoElement.play().then(handlePlay).catch(() => {
          setPlaybackFailed(true);
        });
      };

      videoElement.addEventListener('loadedmetadata', handleMetadataLoad);
      videoElement.addEventListener('timeupdate', handleTimeUpdate);
      videoElement.addEventListener('play', handlePlay);
      videoElement.addEventListener('pause', handlePause);

      // Attempt to play the video when track changes
      playVideo();

      // Cleanup event listeners
      return () => {
        videoElement.removeEventListener('loadedmetadata', handleMetadataLoad);
        videoElement.removeEventListener('timeupdate', handleTimeUpdate);
        videoElement.removeEventListener('play', handlePlay);
        videoElement.removeEventListener('pause', handlePause);
      };
    }
  }, [track]);

  const handlePlayPause = () => {
    const videoElement = videoRef.current;

    if (videoElement) {
      if (isPlaying) {
        videoElement.pause();
      } else {
        videoElement.play().catch(() => {
          setPlaybackFailed(true);
        });
      }
    }
  };

  const handleSeek = (event) => {
    const videoElement = videoRef.current;

    if (videoElement && videoElement.duration > 0) {
      const newTime = (event.target.value / 100) * videoElement.duration;
      videoElement.currentTime = newTime;
    }
  };

  if (!track) {
    return <p>No track selected</p>;
  }

  return (
    <div className={styles.musicPlayer}>
      <h2>Playing Preview: {track.name}</h2>
      <video
        ref={videoRef}
        src={track.preview_url}
        className={styles.videoPlayer}
        controls={false} // Hide default controls if using custom ones
      />
      <div className={styles.controls}>
        <button onClick={handlePlayPause}>
          {isPlaying ? 'Pause' : 'Play'}
        </button>
        <input
          type="range"
          min="0"
          max="100"
          value={progress}
          onChange={handleSeek}
          className={styles.seekBar}
        />
      </div>
      {playbackFailed && (
        <p className={styles.error}>
          Playback failed. Please click the Play button to start the preview.
        </p>
      )}
    </div>
  );
};

export default MusicPlayer;
