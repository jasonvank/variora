import 'regenerator-runtime/runtime'

import {
  Button,
  Col,
  Collapse,
  Form,
  Icon,
  Input,
  notification,
  Popconfirm,
  Row,
  Spin,
  Tooltip,
} from 'antd'

import React from 'react'
import axios from 'axios'
import { getCookie } from 'util.js'
import { FormattedMessage, FormattedHTMLMessage } from 'react-intl'
import { Link } from 'react-router-dom'
const { TextArea } = Input
const FormItem = Form.Item

class GroupSettingsSubtab extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      coteriePk: props.coteriePk,
      coterieName: props.coterieName,
    }
    this.deleteGroup = () => {
      var self = this
      var data = new FormData()
      data.append('csrfmiddlewaretoken', getCookie('csrftoken'))
      axios
        .post('/coterie/api/coteries/' + this.state.coteriePk + '/delete', data)
        .then(function() {
          self.props.removeCoterieCallback(self.state.coteriePk)
        })
    }
    this.exitGroup = () => {
      var self = this
      var data = new FormData()
      data.append('csrfmiddlewaretoken', getCookie('csrftoken'))
      axios.post('/coterie/api/coteries/' + this.state.coteriePk + '/exit', data).then(function() {
        self.props.removeCoterieCallback(self.state.coteriePk)
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
      <span style={{ fontSize: '12px' }}>
        <FormattedMessage id='app.group.invite_members' defaultMessage='Invite new members' />

        <Tooltip
          title={
            <FormattedMessage
              id='app.group.message.join_instruction'
              defaultMessage='Or they can apply to join your group. Simply search the group name and click the apply button'
            />
          }
        >
          <a href='#'>
            <Icon type='info-circle-o' style={{ marginLeft: 6 }} />
          </a>
        </Tooltip>
      </span>
    )

    var deleteGroupSection = (
      <Popconfirm
        title={
          <FormattedMessage
            id='app.group.message.delete_group'
            defaultMessage='Are you sure to delete this group? This cannot be undone'
          />
        }
        onConfirm={() => this.deleteGroup()}
        okText={<Link to='/' >Yes</Link>}
        cancelText='No'
      >
        <a style={{ float: 'right', color: '#F2784B', marginRight: '6%' }}>
          <FormattedMessage id='app.group.delete_group' defaultMessage='Delete this group' />
        </a>
      </Popconfirm>
    )

    var exitGroupSection = (
      <Popconfirm
        title={
          <FormattedMessage
            id='app.group.message.exit_group'
            defaultMessage='Are you sure to exit this group? This cannot be undone'
          />
        }
        onConfirm={() => this.exitGroup()}
        okText={<Link to='/' >Yes</Link>}
        cancelText='No'
      >
        <a style={{ float: 'right', color: '#F2784B', marginRight: '6%' }}>
          <FormattedMessage id='app.group.exit_group' defaultMessage='Exit this group' />
        </a>
      </Popconfirm>
    )

    var deleteDangerZone = (
      <Row>
        <Col>
          <div style={{ marginTop: 18 }}>
            <Collapse accordion>
              <Panel
                header={
                  <FormattedMessage id='app.group.danger_zone' defaultMessage='Danger Zone' />
                }
                key='1'
              >
                <span>
                  {
                    <FormattedMessage
                      id='app.group.message.delete_warning'
                      defaultMessage='Once you delete the group, all admins and members will no longer have access.'
                    />
                  }
                </span>
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
              <Panel
                header={
                  <FormattedMessage id='app.group.danger_zone' defaultMessage='Danger Zone' />
                }
                key='1'
              >
                <span>
                  <FormattedMessage
                    id='app.group.message.exit_warning'
                    defaultMessage='Once you exit the group, you will no longer have access'
                  />
                </span>
                {exitGroupSection}
              </Panel>
            </Collapse>
          </div>
        </Col>
      </Row>
    )

    return (
      <div>
        {this.props.isAdmin ? deleteDangerZone : exitDangerZone}
        {this.props.isAdmin ? (
          <GroupInformationChange
            coteriePk={this.state.coteriePk}
            coterieName={this.state.coterieName}
            updateCoterieCallback={this.props.updateCoterieCallback}
          />
        ) : null}
      </div>
    )
  }
}

class GroupInformationChange extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      loading: false,
      coteriePk: props.coteriePk,
      coterieName: props.coterieName,
      // 'coterieDesc': props.coterieDesc,
    }

    this.handleSubmit = e => {
      var self = this

      e.preventDefault()
      this.setState({ loading: true })
      const newName = this.state.coterieName
      // const newDesc = this.state.coterieDescription

      if (newName == '') {
        self.setState({ loading: false })
        notification['warning']({ message: 'Group name cannot be empty', duration: 4 })
        return
      }

      var data = new FormData()
      data.append('new_name', newName)
      // data.append('new_desc', newDesc)
      data.append('csrfmiddlewaretoken', getCookie('csrftoken'))

      axios
        .post('/coterie/api/coteries/' + this.state.coteriePk + '/update', data)
        .then(function() {
          self.props.updateCoterieCallback(self.state.coteriePk, newName)
          self.setState({ loading: false })
          notification['success']({ message: 'Group info updated', duration: 4 })
        })
    }
  }

  componentWillReceiveProps(nextProps) {
    this.setState({
      coteriePk: nextProps.coteriePk,
      coterieName: nextProps.coterieName,
      coterieDesc: nextProps.coterieDesc,
    })
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
              label={<FormattedMessage id='app.group.name' defaultMessage='Group Name' />}
              {...formItemLayout}
            >
              <Input
                value={this.state.coterieName}
                onChange={async e => await this.setState({ coterieName: e.target.value })}
              />
            </FormItem>
            {/*<FormItem*/}
            {/*label="Description"*/}
            {/*{...formItemLayout}*/}
            {/*>*/}
            {/*<TextArea rows={6}*/}
            {/*value={this.state.coterieDesc}*/}
            {/*onChange={async (e) => {*/}
            {/*await this.setState({ coterieDescription: e.target.value })*/}
            {/*}}*/}
            {/*/>*/}
            {/*</FormItem>*/}
            <FormItem {...buttonItemLayout}>
              <Button type='primary' htmlType='submit'>
                <FormattedMessage id='app.group.update' defaultMessage='Update' />
              </Button>
            </FormItem>
          </Form>
        </div>
      </Spin>
    )
  }
}

export { GroupSettingsSubtab }
