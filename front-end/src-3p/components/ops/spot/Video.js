import React from 'react';

import PropTypes from 'prop-types';
import { StyleSheet, css } from 'aphrodite';

function Video(props) {
  if (!props.url) {
    return (<div>Loading...</div>);
  }

  return (
    <div className={css(styles.videoContainer)}>
      <video
        className={css(styles.videoElement)}
        width="320px"
        controls
        src={props.url}
        preload="auto"
      >
        Not supported
      </video>
    </div>
  );
}

Video.propTypes = {
  url: PropTypes.string,
};

const styles = StyleSheet.create({
  videoContainer: {
    padding: "20px",
    marginBottom: "2rem",
    border: "2px solid #ccc",
    borderRadius: "15px",
  },
  videoElement: {
    maxHeight: "350px",
  }
});

export default Video;
