import { Button, Card, Col, Icon, Layout, Row, Tabs, notification } from 'antd'

import React from 'react'
import TimeAgo from 'react-timeago'
import { connect } from 'react-redux'
import {fetchExploreDocs} from '../redux/actions.js'

const TabPane = Tabs.TabPane;


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
    this.forceUpdate()
  }

  render() {
    return (
      <Row type='flex' justify='start'><DocumentListWrapper data = {this.state.data}/> </Row>
    )
  }
}


class ExploreTabBeforeConnect extends React.Component {
  constructor(props) {
    super(props)
  }

  componentDidMount() {
    if (this.props.mostViewsDocuments == undefined)
      this.props.fetchExploreDocs()
  }

  render() {
    return (
      <div style={{ paddingLeft: 18, paddingRight: 18, paddingTop: 16, paddingBottom: 60, minHeight: 280 }}>
        <div className='card' style={{ overflow: 'auto', color: 'white' }}>
          <div className='card-header pubIndex-recommendationsHeader'>
            <div className='card-headerText' style={{ color: 'black' }}>Most Views</div>
          </div>
          {<DisplayDocuments data={this.props.mostViewsDocuments} />}
        </div>

        <div className='card' style={{ overflow: 'auto', color: 'white', marginTop: 18 }}>
          <div className='card-header pubIndex-recommendationsHeader'>
            <div className='card-headerText' style={{ color: 'black' }}>Most Stars</div>
          </div>
          {<DisplayDocuments data={this.props.mostStarsDocuments} />}
        </div>

        <div className='card' style={{ overflow: 'auto', color: 'white', marginTop: 18  }}>
          <div className='card-header pubIndex-recommendationsHeader'>
            <div className='card-headerText' style={{ color: 'black' }}>Most Annotations</div>
          </div>
          {<DisplayDocuments data={this.props.mostAnnotationsDocuments} />}
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
const ExploreTab = connect(mapStoreToProps, {fetchExploreDocs})(ExploreTabBeforeConnect)
export { ExploreTab }
