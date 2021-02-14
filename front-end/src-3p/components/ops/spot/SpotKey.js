import React from "react";

function SpotKey() {
  return (
    <div>
      <div>
        <span className="spot-cell spot-cell-key">Basic cell</span>
        <span className="spot-cell spot-cell-key spot-cell-edited">Edited cell</span>
        <span className="spot-cell spot-cell-key spot-cell-modified">Modified cell cell</span>
      </div>
      <div>
        <span className="spot-cell spot-cell-key spot-detection">Spotted correctly!</span>
        <span className="spot-cell spot-cell-key spot-redundant">Spotted redundantly :/</span>
        <span className="spot-cell spot-cell-key spot-false-alarm">False alarm!</span>
      </div>
    </div>
  );
}

export default SpotKey;
