import './css/sign_in_index.css'
import 'regenerator-runtime/runtime'

import { Button, Row, Col, Form, Icon, Input, Layout, LocaleProvider, Menu, Modal, Upload, notification } from 'antd'

import React from 'react'
import ReactDOM from 'react-dom'
import enUS from 'antd/lib/locale-provider/en_US'

const FormItem = Form.Item
const Dragger = Upload.Dragger


class Main extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      previewVisible: false,
      previewImage: '',
      fileList: [],
    }

    this.fileReader = new FileReader()
    this.jobs = []
    this.isReaderWorking = false

    var self = this
    this.fileReader.onload = function() {
      var img = new Image()
      img.src = self.fileReader.result
      img.onload = function() {
        var newFileList = self.state.fileList
        var index = self.jobs.shift()
        newFileList[index].img = img
        newFileList[index].status = 'done'
        newFileList[index].url = img.src
        newFileList[index].thumbUrl = img.src
        self.setState({fileList: newFileList})
        if (self.jobs.length > 0)
          self.work()
        else
          self.isReaderWorking = false
      }
    }

    this.work = () => {
      self.isReaderWorking = true
      this.fileReader.readAsDataURL(this.state.fileList[this.jobs[0]].file)
    }

    this.handleBeforeUpload = (file, fileList) => {
      // console.log(file)
      var newFileList = this.state.fileList
      newFileList.push({
        file: file,
        status: 'uploading',
        uid: file.uid,
        name: file.name,
        img: undefined,
      })
      this.setState({fileList: newFileList})

      this.jobs.push([newFileList.length - 1])
      if (!this.isReaderWorking)
        this.work()

      return false
    }

    this.handleCancel = () => this.setState({ previewVisible: false })

    this.handlePreview = (file) => {
      this.setState({ previewImage: file.img.src, previewVisible: true, })
    }

    this.handleRemove = (file) => {
      for (var i = 0; i < this.state.fileList.length; i++) {
        if (this.state.fileList[i].uid === file.uid) {
          var newFileList = this.state.fileList
          newFileList.splice(i, 1)
          this.setState({fileList: newFileList})
          break
        }
      }
    }

    this.makePdf = () => {
      var doc = new jsPDF()  //new jsPDF('p', 'mm', [297, 210])
      var numPage = 1

      // doc.text('Made with Variora', 8, 8)

      for (var pageIndex = 1; pageIndex <= this.state.fileList.length; pageIndex++) {
        var img = this.state.fileList[pageIndex - 1].img
        if (pageIndex > 1) {
          doc.addPage()
          doc.setPage(pageIndex)
        }
        var height, width, x, y = 0
        if (img.height / img.width > 297 / 210) {
          height = 297
          width = 297 / img.height * img.width
          y = 0
          x = (210 - width) / 2
        } else {
          width = 210
          height = 210 / img.width * img.height
          x = 0
          y = (297 - height) / 2
        }
        doc.addImage(img, 'JPEG', x, y, width, height)
      }

      doc.save('PDF made by Variora.pdf')
    }
  }

  render() {
    const { previewVisible, previewImage, fileList } = this.state
    const uploadButton = (
      <div>
        <Icon type="plus" />
        <div className="ant-upload-text">Upload</div>
      </div>
    )

    var props = {
      name: 'file',
      multiple: true,
      showUploadList: true,
      listType: 'picture',
      action: '',
      fileList: this.state.fileList,
      onPreview: this.handlePreview,
      beforeUpload: this.handleBeforeUpload,
      onRemove: this.handleRemove,
    }
    return (
      <div className="clearfix">
        {/* <Row style={{ textAlign: 'center', marginTop: 18 }}>
          <a href='/'><img src="/media/logo.png" height={66} /></a>
        </Row> */}

        <Row style={{marginTop: '6%', marginBottom: '6%'}}>
          <Col span={12} offset={6}>
            <Dragger {...props} style={{padding: 18}}>
              <p className="ant-upload-drag-icon">
                <Icon type="inbox" />
              </p>
              <p className="ant-upload-hint">Click or drag image(s) to this area. They will be put into one PDF document.</p>
              {/* <p className="ant-upload-hint">Support for a single or bulk upload. Strictly prohibit from uploading company data or other band files</p> */}
            </Dragger>

            <Button type='primary' style={{marginTop: 18}} className='login-form-button' onClick={this.makePdf}>
              Merge into one PDF document
            </Button>
          </Col>
        </Row>

        {/* <Upload
          action=""
          listType="picture-card"
          fileList={fileList}
          onPreview={this.handlePreview}
          beforeUpload={this.handleBeforeUpload}
        >
          {uploadButton}
        </Upload> */}

        <Modal visible={previewVisible} footer={null} onCancel={this.handleCancel}>
          <img alt="example" style={{ width: '100%' }} src={previewImage} />
        </Modal>
      </div>
    )
  }
}

ReactDOM.render(
  <LocaleProvider locale={enUS}>
    <Main />
  </LocaleProvider>,
  document.getElementById('main')
)




// <!DOCTYPE html>
// <html lang="en">
// <head>
//     <meta charset="UTF-8">
//     <meta name="viewport" content="width=device-width, initial-scale=1.0">
//     <meta http-equiv="X-UA-Compatible" content="ie=edge">

//     <script src="https://unpkg.com/jspdf@latest/dist/jspdf.min.js"></script>

//     <script
//     src="https://code.jquery.com/jquery-3.3.1.slim.min.js"
//     integrity="sha256-3edrmyuQ0w65f8gfBsqowzjJe2iM6n0nKciPUp8y+7E="
//     crossorigin="anonymous"></script>

//     <title>Document</title>
// </head>
// <body>
//     <form action="">
//         <input type="file" onchange="addFile(this.files)">
//         <input type="file" onchange="addFile(this.files)">
//         <button type="button" id="btn"> to pdf </button>
//     </form>

// </body>
// <script>
// var images = []
// var reader = new FileReader()

// reader.onload = function() { // file is loaded
//     var img = new Image()
//     img.onload = function() {
//         images.push(img)
//         // console.log(images)
//         // console.log(img.width)
//         // console.log(img.height)
//         document.getElementById("btn").disabled = false
//     };
//     img.src = reader.result;
// }

// function addFile(file) {
//     document.getElementById("btn").disabled = true
//     file = file[0]
//     reader.readAsDataURL(file);
// }

// $(document).ready(function() {
//     $('#btn').on('click', function() {
//         var doc = new jsPDF()  //new jsPDF('p', 'mm', [297, 210])
//         var numPage = 1

//         doc.text('Made with Variora', 8, 8)

//         for (var pageIndex = 1; pageIndex <= images.length; pageIndex++) {
//             var img = images[pageIndex - 1]
//             if (pageIndex > 1) {
//                 doc.addPage()
//                 doc.setPage(pageIndex)
//             }
//             var height, width, x, y = 0
//             if (img.height / img.width > 297 / 210) {
//                 height = 297
//                 width = 297 / img.height * img.width
//                 y = 0
//                 x = (210 - width) / 2
//             } else {
//                 width = 210
//                 height = 210 / img.width * img.height
//                 x = 0
//                 y = (297 - height) / 2
//             }
//             doc.addImage(img, 'JPEG', x, y, width, height)
//         }

//         doc.save('aaaaaaaaaaaaaaaaaaaaaa.pdf')
//     })
// })

// </script>
// </html>
