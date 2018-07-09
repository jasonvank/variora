import { Button, Col, Icon, Input, Layout, Menu, Modal, Row, Upload, notification } from 'antd'
import { Link, Route, BrowserRouter as Router, Switch } from 'react-router-dom'
import { getCookie, getUrlFormat } from 'util.js'

import React from 'react'
import axios from 'axios'


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


class ExploreTab extends React.Component {
  constructor() {
    super()
  }

  render() {
    return (
      <div style={{ paddingLeft: 18, paddingRight: 18, paddingTop: 8, margin: 0, minHeight: 280 }}>
        <div className='card' style={{ overflow: 'auto', backgroundColor: 'white', marginTop: 18 }}>
          <div className='PageDiv' style={{ display: 'inline-block', margin: 18, width: 120, height: 160, boxShadow: '2px 2px 8px rgba(0, 0, 0, .25)' }}>
            <a href='https://www.google.com'>
              <img href='' />
            </a>
          </div>
        </div>
      </div>
    )
  }
}

export { ExploreTab }
