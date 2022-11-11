import React from "react";
import "./App.css";
import ControlledView from "./ControlledView";
import DefaultView from "./DefaultView";
import StyledView from "./StyledView";

const App: React.FC = () => {
  return (
    <div className="App">
      <h1>YT-Tree</h1>
      <h2>Default</h2>
      <p className="example">
        <DefaultView />
      </p>
      <h2>Styled</h2>
      <p className="example">
        <StyledView />
      </p>
      <h2>Controlled</h2>
      <p className="example">
        <ControlledView />
      </p>
    </div>
  );
};

export default App;
