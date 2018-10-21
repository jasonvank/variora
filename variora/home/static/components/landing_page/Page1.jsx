import React from 'react'
import ScrollOverPack from 'rc-scroll-anim/lib/ScrollOverPack'
import { Row, Col, Card } from 'antd'
import QueueAnim from 'rc-queue-anim'


class DisplayFeatures extends React.Component {
  render() {
    return(
      <div style={{ padding: '30px' }}>
        <Row gutter={16}>
          <Col span={8}>
            <Card style={{ width: 250 }} bodyStyle={{ padding: 0 }}>
              <div className="custom-image">
                <img alt="example" width="248" height="280" src="../../../../media/teamwork.jpg" />
              </div>
              <div className="custom-card">
                <h3 style={{ fontSize: 18 }}>Discussion</h3>
                <p style={{ fontSize: 12 }}>Real-time communication and discussion with team members</p>
              </div>
            </Card>
          </Col>
          <Col span={8}>
            <Card style={{ width: 250 }} bodyStyle={{ padding: 0 }}>
              <div className="custom-image">
                <img alt="example" width="248" height="280" src="../../../../media/discussion.png" />
              </div>
              <div className="custom-card">
                <h3 style={{ fontSize: 18 }}>Visualisation</h3>
                <p style={{ fontSize: 12 }}>Visualize your idea using annotations, comments and graphs</p>
              </div>
            </Card>
          </Col>
          <Col span={8}>
            <Card style={{ width: 250 }} bodyStyle={{ padding: 0 }}>
              <div className="custom-image">
                <img alt="example" width="248" height="280" src="../../../../media/innovation.jpg" />
              </div>
              <div className="custom-card">
                <h3 style={{ fontSize: 18 }}>Innovation</h3>
                <p style={{ fontSize: 12 }}>Catch every moment when you have innovative ideas</p>
              </div>
            </Card>
            </Col>
        </Row>
      </div>
    )
  }
}

class Page1 extends React.Component {
  state = {
    hoverKey: null,
  }
  onMouseOver = (key) => {
    this.setState({
      hoverKey: key,
    })
  }
  onMouseOut = () => {
    this.setState({
      hoverKey: null,
    })
  }
  getEnter = (i, e) => {
    const ii = e.index
    const r = (Math.random() * 2) - 1
    const y = (Math.random() * 10) + 10
    const delay = Math.round(Math.random() * (ii * 30))
    const pos = svgToXY[i][ii]
    return [
      { x: 100, y: 150, duration: 0 },
      {
        delay, opacity: 1, x: pos.x, y: pos.y, ease: 'easeOutBack', duration: 300,
      },
      {
        y: r > 0 ? `+=${y}` : `-=${y}`,
        duration: (Math.random() * 1000) + 2000,
        yoyo: true,
        repeat: -1,
      },
    ]
  }
  getSvgChild = child => child.map((item, i) => {
    const props = { ...item.props }
    if (item.type === 'g') {
      props.transform = null
    } else {
      ['x', 'y', 'cx', 'cy'].forEach((str) => {
        if (str in props) {
          props[str] = null
        }
      })
    }
    return (
      <g key={i.toString()} >
        {React.cloneElement(item, props)}
      </g>
    )
  })
  leave = {
    opacity: 0, duration: 300, x: 100, y: 150, ease: 'easeInBack',
  }
  render() {
    return (
      <div className='home-page-wrapper page1'>
        <div className='page' >
          <h2>Get started using Variora</h2>
          <ScrollOverPack playScale='0.3'>
            <QueueAnim
              component={Row}
              key='queue'
              type='bottom'
              ease={['easeOutQuart', 'easeInQuart']}
              leaveReverse
            >
            {<DisplayFeatures />}
            </QueueAnim>
          </ScrollOverPack>
        </div>
      </div>
    )
  }
}

export { Page1 }
