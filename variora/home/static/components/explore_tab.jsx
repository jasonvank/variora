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
      this.setState({ loading: !this.state.loading });
    }
  }

  render() {
    return (
      this.state.data.map(item => <div key = {item.key} className="gutter-example" style={{ textAlign: 'center'}} >
        <Col>
          <a target='_blank' href={item.open_url} >
            <img alt="example" src={item.image} style={{ display: 'inline-block', margin: 28, marginBottom: 5, width: 135, height: 180, borderRadius: 4, boxShadow: '0px 1px 3px rgba(26, 26, 26, .1)' }} />
          </a>
          <figcaption style={{ textAlign: 'center' }}>{item.title}</figcaption>
        </Col>
      </div>
      )
    )
  }
}


class MostViewsDocuments extends React.Component {
  constructor(props){
    super(props)
    this.state = {}
  }


  render() {
    const mostViewsDocumentsList = [{
      key: '1',
      title: 'CS50 2014',
      open_url: 'https://www.baidu.com',
      image: 'https://is3-ssl.mzstatic.com/image/thumb/course/CobaltPublic128/v4/9a/64/9e/9a649e5b-84e5-c503-6297-e2d5d24d7ae7/source/1200x630.png'
    }, {
      key: '2',
      title: 'Prof Luo',
      open_url: 'https://www.google.com',
      image: 'https://media.licdn.com/dms/image/C5603AQE_rcRwZyxXvg/profile-displayphoto-shrink_200_200/0?e=1534982400&v=beta&t=kKawtobnI1aNTYbD9cEhscMTfAHssMqrNIuLeIuQ28I'
    }, {
      key: '3',
      title: 'Data Structure and Algorithm',
      open_url: 'https://www.google.com',
      image: 'https://qph.fs.quoracdn.net/main-qimg-c107f48153cfd9bf2c2f819a668beb8a-c'
    }, {
      key: '4',
      title: 'Test Document',
      open_url: 'https://www.google.com',
      image: 'https://www.wada-ama.org/sites/default/files/resources/thumbnails/tdssa_2017_eng_page_01.jpg'
    }, {
      key: '5',
      title: 'The Economic Approach to Law',
      open_url: 'https://www.google.com',
      image: 'https://www.sup.org/img/covers/medium/pid_27372.jpg'
    }, {
      key: '6',
      title: 'The Economic Approach to Law',
      open_url: 'https://www.google.com',
      image: 'https://www.wada-ama.org/sites/default/files/resources/thumbnails/tdssa_2017_eng_page_01.jpg'
    }

    ]

    return (
      <Row type="flex" justify="center"><DocumentListWrapper data = {mostViewsDocumentsList}/> </Row>
    )
  }
}

class MostStarsDocuments extends React.Component {
  constructor(props){
    super(props)
    this.state = {}
  }


  render() {
    const MostStarsDocumentsList = [{
      key: '1',
      title: 'CS50 2014',
      open_url: 'https://www.baidu.com',
      image: 'https://is3-ssl.mzstatic.com/image/thumb/course/CobaltPublic128/v4/9a/64/9e/9a649e5b-84e5-c503-6297-e2d5d24d7ae7/source/1200x630.png'
    }, {
      key: '2',
      title: 'Prof Luo',
      open_url: 'https://www.google.com',
      image: 'https://www.wada-ama.org/sites/default/files/resources/thumbnails/tdssa_2017_eng_page_01.jpg'
    }, {
      key: '3',
      title: 'Data Structure and Algorithm',
      open_url: 'https://www.google.com',

      image: 'https://is3-ssl.mzstatic.com/image/thumb/course/CobaltPublic128/v4/9a/64/9e/9a649e5b-84e5-c503-6297-e2d5d24d7ae7/source/1200x630.png'
    }, {
      key: '4',
      title: 'Test Document',
      open_url: 'https://www.google.com',
      image: 'https://www.wada-ama.org/sites/default/files/resources/thumbnails/tdssa_2017_eng_page_01.jpg'
    }, {
      key: '5',
      title: 'The Economic Approach to Law',
      open_url: 'https://www.google.com',
      image: 'https://www.sup.org/img/covers/medium/pid_27372.jpg'
    }, {
      key: '6',
      title: 'The Economic Approach to Law',
      open_url: 'https://www.google.com',
      image: 'https://www.wada-ama.org/sites/default/files/resources/thumbnails/tdssa_2017_eng_page_01.jpg'
    }

    ]

    return (
      <Row type="flex" justify="center"><DocumentListWrapper data = {MostStarsDocumentsList}/> </Row>
    )
  }
}

class MostAnnotationsDocuments extends React.Component {
  constructor(props){
    super(props)
    this.state = {}
  }


  render() {
    const MostAnnotationsDocumentsList = [{
      key: '1',
      title: 'CS50 2014',
      open_url: 'https://www.baidu.com',

      image: 'https://qph.fs.quoracdn.net/main-qimg-c107f48153cfd9bf2c2f819a668beb8a-c'
    }, {
      key: '2',
      title: 'Prof Luo',
      open_url: 'https://www.google.com',
      image: 'https://www.wada-ama.org/sites/default/files/resources/thumbnails/tdssa_2017_eng_page_01.jpg'
    }, {
      key: '3',
      title: 'Data Structure and Algorithm',
      open_url: 'https://www.google.com',
      image: 'https://is3-ssl.mzstatic.com/image/thumb/course/CobaltPublic128/v4/9a/64/9e/9a649e5b-84e5-c503-6297-e2d5d24d7ae7/source/1200x630.png'
    }, {
      key: '4',
      title: 'Test Document',
      open_url: 'https://www.google.com',
      image: 'https://is3-ssl.mzstatic.com/image/thumb/course/CobaltPublic128/v4/9a/64/9e/9a649e5b-84e5-c503-6297-e2d5d24d7ae7/source/1200x630.png'
    }, {
      key: '5',
      title: 'The Economic Approach to Law',
      open_url: 'https://www.google.com',
      image: 'https://www.sup.org/img/covers/medium/pid_27372.jpg'
    }, {
      key: '6',
      title: 'The Economic Approach to Law',
      open_url: 'https://www.google.com',
      image: 'https://www.sup.org/img/covers/medium/pid_27372.jpg'
    }

    ]

    return (
      <Row type="flex" justify="center"><DocumentListWrapper data = {MostAnnotationsDocumentsList}/> </Row>
    )
  }
}



class ExploreTab extends React.Component {
  constructor(props) {
    super(props)
  }

  render() {
    return (
      <div style={{ paddingLeft: 18, paddingRight: 18, paddingTop: 16, paddingBottom: 60, minHeight: 280, backgroundColor: '#f4f4f4'}}>
        <div style={{ overflow: 'auto',  marginTop: 18 }}>
          <Tabs defaultActiveKey='1' >
            <TabPane tab={<span><Icon type="like-o" />Most Views</span>}  key="1">
              {<MostViewsDocuments />}
            </TabPane>
          </Tabs>
        </div>

        <div  style={{ overflow: 'auto', marginTop: 18 }}>
          <Tabs defaultActiveKey='1' >
            <TabPane tab={<span><Icon type="like-o" />Most Stars</span>} key="1">
              {<MostStarsDocuments />}
            </TabPane>
          </Tabs>
        </div>

        <div style={{ overflow: 'auto',  marginTop: 18 }}>
          <Tabs defaultActiveKey='1' >
            <TabPane tab={<span><Icon type="like-o" />Most Annotaions</span>}  key="1">
              {<MostAnnotationsDocuments />}
            </TabPane>
          </Tabs>
        </div>
      </div>
    )
  }
}

export { ExploreTab }
