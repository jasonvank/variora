import { Icon, Input, Button, Row, Form, Radio, Switch, Card, Col, Popconfirm, Table, Collapse, message, notification } from 'antd'
import { formatOpenCoterieDocumentUrl, getCookie, getUrlFormat } from 'util.js'

import React from 'react'
import ReactDOM from 'react-dom'
import axios from 'axios'
import { validateDocumentTitle } from 'home_util.js'
import TimeAgo from 'react-timeago'

const { Column } = Table
const { TextArea } = Input
const Panel = Collapse.Panel
const FormItem = Form.Item
const RadioButton = Radio.Button
const RadioGroup = Radio.Group

class ReadlistSettingsSubtab extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      readlistStatus: 'public',
      readlistName: 'current name',
      readlistDescription: 'current description',
    }
    this.deleteReadList = () => {

    }
    // this.setReadListPrivate = (e) => {
    //   console.log(`radio checked:${e.target.value}`)
    // }
    this.handleSubmit = (e) => {
      e.preventDefault()
      alert('hey')
    }
  }

  componentDidMount() {
  }

  render() {
    const formItemLayout = {
      labelCol: { span: 8 },
      wrapperCol: { span: 8 },
    }

    const buttonItemLayout = {
      wrapperCol: { span: 8, offset: 8 },
    }

    var deleteReadlistSection = (
      <Popconfirm
        title="Are you sure to delete this readlist? This cannot be undone"
        onConfirm={() => this.deleteReadList()}
        okText="Yes" cancelText="No"
      >
        <a style={{ float: 'right', color: '#F2784B', marginRight: '6%' }}>Delete this readlist</a>
      </Popconfirm>
    )

    var deleteReadList = (
      <Row>
        <Col>
          <div style={{ marginTop: 18 }}>
            <Collapse accordion>
              <Panel header="Danger Zone" key="1">
                <span>{'Once you delete this list, all followers and you will no longer have access.'}</span>
                {deleteReadlistSection}
              </Panel>
            </Collapse>
          </div>
        </Col>
      </Row>
    )

    // var setReadListPrivate = (
    //   <Row>
    //     <Col>
    //       <div style={{ marginTop: 18 }}>
    //         <Collapse accordion>
    //           <Panel header="Set readlist to private" key="1">
    //             <span>{'Once you set the group to private, all followers will no longer have access.'}</span>
    //             {setReadListPrivateSection}
    //           </Panel>
    //         </Collapse>
    //       </div>
    //     </Col>
    //   </Row>
    // )

    return (
      <div>
        {deleteReadList}
        <div className={'card'} style={{ overflow: 'auto', marginTop: 16, padding: 18 }}>
          <Form onSubmit={this.handleSubmit}>
            <FormItem
              label="Status"
              {...formItemLayout}
            >
              <RadioGroup onChange={this.setReadListPrivate} defaultValue={this.state.readlistStatus}>
                <RadioButton value="public">public</RadioButton>
                <RadioButton value="private">private</RadioButton>
              </RadioGroup>
            </FormItem>
            <FormItem
              label="Name"
              {...formItemLayout}
            >
              <Input value={this.state.readlistName} onChange={e => this.setState({ readlistName: e.target.value })}/>
            </FormItem>
            <FormItem
              label="Description"
              {...formItemLayout}
            >
              <TextArea value={this.state.readlistDescription} onChange={e => this.setState({ readlistDescription: e.target.value })}/>
            </FormItem>
            <FormItem {...buttonItemLayout}>
              <Button type="primary" htmlType="submit">Submit</Button>
            </FormItem>
          </Form>
        </div>
      </div>
    )
  }
}


export { ReadlistSettingsSubtab }
