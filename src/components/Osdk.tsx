import book from "/book.svg";

import React from "react";
import css from "./Osdk.module.css";

function Osdk(): React.ReactElement {
  return (
    <div className={css.osdk}>
      <div>
        <span>OSDK: </span>
        <span className={css.tag}>@untrayce-application/sdk</span>
      </div>
      <a
        href="https://buildthefuture.usw-22.palantirfoundry.com/workspace/developer-console/app/ri.third-party-applications.main.application.0cb7c86d-0a1b-42ff-9b3d-75e2b0b28caa/docs/guide/loading-data?language=typescript"
        className={css.docs}
        target="_blank"
        rel="noreferrer"
      >
        <img src={book} width={16} height={16} alt="Book icon"></img>
        <span>View documentation</span>
      </a>
    </div>
  );
}

export default Osdk;
