import React from 'react';
import ReactDOM from 'react-dom';

class TestButton extends React.Component {
  constructor() {
    super();
    this.state = {
      message: 'awesome react button',
    }
  }
  render() {
    return (
      <div style={{ width: 240, color: 'green' }}>
        <button>{ this.state.message }</button>
      </div>
    );
  }
}

export default TestButton;
