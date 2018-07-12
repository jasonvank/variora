import { Button, Col, Card, Icon, Input, Layout, Menu, Modal, Row, Tabs, Upload, notification } from 'antd'
import { Link, Route, BrowserRouter as Router, Switch } from 'react-router-dom'
import { getCookie, getUrlFormat } from 'util.js'

import React from 'react'
import axios from 'axios'

const TabPane = Tabs.TabPane;

function prepareAndRenderAll(canvas) {
  PDFJS.workerSrc = '/static/pdfjs/pdf.worker.js'
  PDFJS.getDocument('http://localhost:8000/proxy?origurl=http://www.orimi.com/pdf-test.pdf').then(function(pdf) {
    let pdfDoc = pdf
    pdfDoc.getPage(1).then(function(page) {
      var context = canvas.getContext('2d')
      var viewport = page.getViewport(0.38)
      canvas.height = viewport.height
      canvas.width = viewport.width
      canvas.style.height = viewport.height
      canvas.style.width = viewport.width

      var renderContext = {
        canvasContext: context,
        viewport: viewport,
      }
      page.render(renderContext)
    })
  })
}

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
    // var uploadTime = this.state.data.upload_time
    var dateFormat = require('dateformat')
    // console.log(dateFormat(uploadTime, "mmmm d, yyyy"))

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
                <p>{dateFormat(item.upload_time, "d mmmm yyyy")}</p>
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



class ExploreTab extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      mostViewsDocuments: undefined,
      mostStarsDocuments: undefined,
      mostAnnotationsDocuments: undefined,
    }
  }

  componentDidMount() {
    const self = this
    axios.get(getUrlFormat('/documents/api/documents/explore'))
      .then(response => {
        var mostViewsDocuments = response.data.filter(item => item.description == 'most_views')
        var mostStarsDocuments = response.data.filter(item => item.description == 'most_collectors')
        var mostAnnotationsDocuments = response.data.filter(item => item.description == 'most_annotations')
        self.setState({
          mostViewsDocuments: mostViewsDocuments,
          mostStarsDocuments: mostStarsDocuments,
          mostAnnotationsDocuments: mostAnnotationsDocuments,
        })
      })
  }


  render() {
    return (
      <div style={{ paddingLeft: 18, paddingRight: 18, paddingTop: 16, paddingBottom: 60, minHeight: 280 }}>
        <div className='card' style={{ overflow: 'auto', color: 'white' }}>
          <div className='card-header pubIndex-recommendationsHeader'>
            <div className='card-headerText' style={{ color: 'black' }}>Most Views</div>
          </div>
          {<DisplayDocuments data={this.state.mostViewsDocuments} />}
        </div>

        <div className='card' style={{ overflow: 'auto', color: 'white', marginTop: 18 }}>
          <div className='card-header pubIndex-recommendationsHeader'>
            <div className='card-headerText' style={{ color: 'black' }}>Most Stars</div>
          </div>
          {<DisplayDocuments data={this.state.mostStarsDocuments} />}
        </div>

        <div className='card' style={{ overflow: 'auto', color: 'white', marginTop: 18  }}>
          <div className='card-header pubIndex-recommendationsHeader'>
            <div className='card-headerText' style={{ color: 'black' }}>Most Annotations</div>
          </div>
          {<DisplayDocuments data={this.state.mostAnnotationsDocuments} />}
        </div>
      </div>
    )
  }
}

export { ExploreTab }
