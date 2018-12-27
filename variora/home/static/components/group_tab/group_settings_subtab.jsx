import 'regenerator-runtime/runtime'

import {Button, Col, Collapse, Form, Icon, Input, notification, Popconfirm, Row, Spin, Tooltip} from 'antd'


import React from 'react'
import axios from 'axios'
import { getCookie } from 'util.js'

const { TextArea } = Input
const FormItem = Form.Item

class GroupSettingsSubtab extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      'coteriePk': props.coteriePk,
      'coterieName': props.coterieName,
    }
    this.deleteGroup = () => {
      var self = this
      var data = new FormData()
      data.append('csrfmiddlewaretoken', getCookie('csrftoken'))
      axios.post('/coterie/api/coteries/' + this.state.coteriePk + '/delete', data).then(function() {
        self.props.removeCoterieCallback(self.state.coteriePk)
        window.location.href = '/'
      })
    }
    this.exitGroup = () => {
      var self = this
      var data = new FormData()
      data.append('csrfmiddlewaretoken', getCookie('csrftoken'))
      axios.post('/coterie/api/coteries/' + this.state.coteriePk + '/exit', data).then(function() {
        self.props.removeCoterieCallback(self.state.coteriePk)
        window.location.href = '/'
      })
    }
  }

  componentWillReceiveProps(nextProps) {
    this.setState({
      coteriePk: nextProps.coteriePk,
      coterieName: nextProps.coterieName,
    })
  }

  render() {
    const Panel = Collapse.Panel

    const cardTitle = (
      <span style={{fontSize: '12px'}}>
        Invite new members
        <Tooltip title={'Or they can apply to join your group. Simply search the group name and click the apply button'} >
          <a href="#">
            <Icon type="info-circle-o" style={{marginLeft: 6}} />
          </a>
        </Tooltip>
      </span>
    )


    var deleteGroupSection = (
      <Popconfirm
        title="Are you sure to delete this group? This cannot be undone"
        onConfirm={() => this.deleteGroup()}
        okText="Yes" cancelText="No"
      >
        <a style={{ float: 'right', color: '#F2784B', marginRight: '6%' }}>Delete this group</a>
      </Popconfirm>
    )

    var exitGroupSection = (
      <Popconfirm
        title="Are you sure to exit this group? This cannot be undone"
        onConfirm={() => this.exitGroup()}
        okText="Yes" cancelText="No"
      >
        <a style={{ float: 'right', color: '#F2784B', marginRight: '6%' }}>Exit this group</a>
      </Popconfirm>
    )

    var deleteDangerZone = (
      <Row>
        <Col>
          <div style={{ marginTop: 18 }}>
            <Collapse accordion>
              <Panel header="Danger Zone" key="1">
                <span>{"Once you delete the group, all admins and members will no longer have access."}</span>
                {deleteGroupSection}
              </Panel>
            </Collapse>
          </div>
        </Col>
      </Row>
    )

    var exitDangerZone = (
      <Row>
        <Col>
          <div style={{ marginTop: 18 }}>
            <Collapse accordion>
              <Panel header="Danger Zone" key="1">
                <span>{"Once you exit the group, you will no longer have access"}</span>
                {exitGroupSection}
              </Panel>
            </Collapse>
          </div>
        </Col>
      </Row>
    )

    return (
      <div>
        { this.props.isAdmin ? deleteDangerZone : exitDangerZone }
        { this.props.isAdmin ? <GroupInformationChange coteriePk = {this.state.coteriePk} coterieName = {this.state.coterieName} updateCoterieCallback = {this.props.updateCoterieCallback} /> : null}
      </div>
    )
  }
}


class GroupInformationChange extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      'loading': false,
      'coteriePk': props.coteriePk,
      'coterieName': props.coterieName,

    }

    this.handleSubmit = (e) => {
      var self = this

      e.preventDefault()
      this.setState({loading: true})
      const newName = this.state.coterieName
      // const newDesc = this.state.readlistDescription

      var data1 = new FormData()
      data1.append('new_name', newName)
      data1.append('csrfmiddlewaretoken', getCookie('csrftoken'))

      // var data2 = new FormData()
      // data2.append('new_desc', newDesc)
      // data2.append('csrfmiddlewaretoken', getCookie('csrftoken'))

      console.log(this.state.coterieName)
      axios.post('/coterie/api/coteries/' + this.state.coteriePk + '/update', data1).then(function() {
        self.setState({loading: false})
        self.props.updateCoterieCallback(self.state.coteriePk, newName)
         notification['success']({ message: 'Group info updated', })
      })
    }
  }


  componentWillReceiveProps(nextProps) {
    this.setState({
      coteriePk: nextProps.coteriePk,
      coterieName: nextProps.coterieName,
    })
    console.log("tttt", nextProps)
  }

  render() {
    const formItemLayout = {
      labelCol: { span: 8 },
      wrapperCol: { span: 8 },
    }

    const buttonItemLayout = {
      wrapperCol: { span: 8, offset: 8 },
    }
    return (
      <Spin spinning={this.state.loading}>
        <div className={'card'} style={{ overflow: 'auto', marginTop: 16, padding: 18 }}>
          <Form style={{ marginTop: 24 }} onSubmit={this.handleSubmit}>
            <FormItem
              label="Group Name"
              {...formItemLayout}
            >
              <Input value={this.state.coterieName} onChange={async (e) => await this.setState({ coterieName: e.target.value })}/>

            </FormItem>
            {/*<FormItem*/}
              {/*label="Description"*/}
              {/*{...formItemLayout}*/}
            {/*>*/}
              {/*<TextArea rows={6}*/}
                {/*value={this.state.readlistDescription}*/}
                {/*onChange={async (e) => {*/}
                  {/*await this.setState({ readlistDescription: e.target.value })*/}
                {/*}}*/}
              {/*/>*/}
            {/*</FormItem>*/}
            <FormItem {...buttonItemLayout}>
              <Button type="primary" htmlType="submit">Submit</Button>
            </FormItem>
          </Form>
        </div>
      </Spin>
    )
  }
}

export { GroupSettingsSubtab }

