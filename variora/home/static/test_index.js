import React from 'react';
import ReactDOM from 'react-dom';
import TestButton from 'testbutton.jsx'

class App extends React.Component {
  constructor() {
    super();
    this.state = {
      message: 'awesome react',
    }
  }
  render() {
    return (
      <div style={{ width: 240, color: 'green' }}>
        < TestButton />
        <h1> {this.state.message} </h1>
      </div>
    );
  }
}

ReactDOM.render(<App />, document.getElementById('navigation'));
