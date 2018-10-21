import React from 'react'
import ReactDOM from 'react-dom'
import ScrollOverPack from 'rc-scroll-anim/lib/ScrollOverPack'
import { Row, Col, Card } from 'antd'
import QueueAnim from 'rc-queue-anim'
import {fetchExploreDocs, fetchExploreReadlists} from '../../redux/actions.js'

import svgBgToParallax from './util.jsx'
import { connect } from 'react-redux';
import TimeAgo from 'react-timeago'
class DocumentListWrapper extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      data: this.props.data,
    }
    this.handleClick = () => {
      this.setState({ loading: !this.state.loading })
    }
  }

  componentWillReceiveProps(nextProps) {
    this.setState({
      data: nextProps.data
    })
    this.forceUpdate()
  }

  render() {
    return (
      this.state.data == undefined ? [] :
        this.state.data.map(item => <div key = {item.open_url} className='gutter-example' style={{ textAlign: 'center', margin: 40 }} >
          <Col>
            <Card style={{ width: 200 }} className='custome-card-cover' bodyStyle={{ padding: 0 }}>
              <div className='custom-image'>
                <a target='_blank' href={item.open_url} >
                  <img width='100%' height='240' src={item.image} />
                </a>
              </div>
              <div className='custom-card'>
                <h3 className='custom-card-text-wrapper' title={item.title} >{item.title}</h3>
                <p><TimeAgo style={{color: '#91959d'}} date={item.upload_time} /></p>
              </div>
            </Card>
          </Col>
        </div>
        )
    )
  }
}
class DisplayDocuments extends React.Component {
  constructor(props){
    super(props)
    this.state = {
      data: this.props.data
    }
  }

  componentWillReceiveProps(nextProps) {
    this.setState({
      data: nextProps.data
    })
  }

  render() {
    return (
      <div className='card' style={{ overflow: 'auto', color: 'white' }}>
        <Row type='flex' justify='start'><DocumentListWrapper data = {this.state.data}/> </Row>
      </div>
    )
  }
}
class DocumentTab extends React.Component {
  constructor(props){
    super(props)
    this.state = {
      data: this.props.data
    }
  }

  componentWillReceiveProps(nextProps) {
    this.setState({
      data: nextProps.data,
    })
  }

  render() {
    return (
      // <div style={{ paddingBottom: 60}}>
        <div className='card' style={{ overflow: 'auto', color: 'white', marginTop: 18 }}>
          {<DisplayDocuments data={this.state.data.mostViewsDocuments} />}
        {/* </div> */}
      </div>
    )
  }
}



class Page3BeforeConnect extends React.Component {
  constructor(props){
    super(props)
  }

  render(){
    return (
      <div className='home-page-wrapper page3' id='page3'>
        <div className='page' >
          <h2>Most Views Documents</h2>
          <ScrollOverPack location='page3'>
            <QueueAnim
              key='queue'
              component={Row}
              type='bottom'
              leaveReverse
            >
              {<DocumentTab data={this.props} />}
            </QueueAnim>
          </ScrollOverPack>
        </div>
      </div>
    )
  }
}

const mapStoreToProps = (store, ownProps) => {
  return {
    ...ownProps,
    ...store
  }
}
const Page3 = connect(mapStoreToProps, {fetchExploreDocs, fetchExploreReadlists})(Page3BeforeConnect)
export { Page3 }
