import 'regenerator-runtime/runtime'

import { Button, Col, Collapse, Icon, Input, Layout, Menu, Popconfirm, Row, notification } from 'antd'
import {
  Link,
  Route,
  BrowserRouter as Router
} from 'react-router-dom'

import React from 'react'
import axios from 'axios'
import enUS from 'antd/lib/locale-provider/en_US'
import { getCookie } from 'util.js'
import validator from 'email-validator'

const { SubMenu } = Menu
const { Header, Content, Sider } = Layout
const { TextArea } = Input
const MenuItemGroup = Menu.ItemGroup


class GroupSettingsSubtab extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      'coteriePk': props.coteriePk
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
      coteriePk: nextProps.coteriePk
    })
  }

  render() {
    const Panel = Collapse.Panel

    var invitationSection = (
      <div className={'card'} style={{ backgroundColor: 'white', margin: '18px 0 28px 0' }}>
        <GroupInvitationForm coteriePk={this.state.coteriePk}/>
      </div>
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
        { this.props.isAdmin ? invitationSection : null }
      </div>
    )
  }
}

class SuccessfulInvitationsNotificationWrapper extends React.Component {
  render() {
    var successful_applications = this.props.successful_applications
    var emailListItems = successful_applications.map(function(invitation) {
      return <li key={invitation.pk} ><p>{invitation.invitee_nickname + '  '}<code>{'<' + invitation.invitee_email + '>'}</code></p></li>
    })
    return (
      <div>
        to<br />
        <ul>
          { emailListItems }
        </ul>
      </div>
    )
  }
}

class UnregisteredEmailsNotificationWrapper extends React.Component {
  render() {
    var unregistered_emails = this.props.unregistered_emails
    var listItems = unregistered_emails.map(function(email) {
      return <li key={email} ><code>{'<' + email + '>'}</code></li>
    })
    return (
      <ul>
        { listItems }
      </ul>
    )
  }
}

class GroupInvitationForm extends React.Component {
  constructor() {
    super()
    this.state = {
      emailList : '',
      invitationMessage : '',
    }

    this.sendInvitation = () => {
      var [isValid, emailList] = this.preprocessEmailsString(this.state.emailList)
      if (!isValid) {
        notification['warning']({
          message: 'Email list input is not valid',
          description: 'Please check again!',
          duration: 2
        })
        return
      }

      var data = new FormData()
      data.append('coterie_id', this.props.coteriePk)
      data.append('invitee_emails', this.state.emailList)
      data.append('invitation_message', this.state.invitationMessage)
      data.append('csrfmiddlewaretoken', getCookie('csrftoken'))
      axios.post('/coterie/api/invite', data).then((response) => {
        var successful_applications = response.data['successful_invitations']
        var unregistered_emails = response.data['unregistered_emails']
        if (successful_applications.length > 0)
          notification['success']({
            message: 'Invitations successfully sent',
            description: <SuccessfulInvitationsNotificationWrapper successful_applications={successful_applications}/>,
            duration: 0
          })
        if (unregistered_emails.length > 0)
          notification['warning']({
            message: 'Following emails are not registered yet',
            description: <UnregisteredEmailsNotificationWrapper unregistered_emails={unregistered_emails}/>,
            duration: 0,
            style: {
              width: 380,
              marginLeft: 335 - 380,
            },
          })

      })
    }

    this.onEmailListInputChange = this.onEmailListInputChange.bind(this)
    this.onInvitationMessageInputChange = this.onInvitationMessageInputChange.bind(this)
  }

  async onEmailListInputChange(e) {
    await this.setState({ emailList: e.target.value })
  }

  async onInvitationMessageInputChange(e) {
    await this.setState({ invitationMessage: e.target.value })
  }

  _emailsStringToArray(emailsString) {
    var rows = emailsString.trim().split('\n')
    var emailsArray = []
    for (var row of rows)
      emailsArray = emailsArray.concat(row.trim().split(','))
    return emailsArray
  }

  preprocessEmailsString(emailsString) {
    var emailArray = this._emailsStringToArray(emailsString)
    var returnedEmailArray = []
    for (var email of emailArray) {
      email = email.trim()
      if (!validator.validate(email))
        return (false, [])
      returnedEmailArray.push(email)
    }
    return [true, returnedEmailArray.join(',')]
  }

  render() {
    return (
      <Row>
        <Col span={12} offset={6}>
          <div style={{ backgroundColor: 'white', marginTop: 28 }}>
            <TextArea
            rows={2}
            value={this.state.emailList}
            onChange={this.onEmailListInputChange}
            placeholder={"Multiple emails can be seperated by comma"}
            />
          </div>
          <div style={{ backgroundColor: 'white', marginTop: 28 }}>
            <TextArea
            rows={4}
            value={this.state.invitationMessage}
            onChange={this.onInvitationMessageInputChange}
            placeholder={"Messages to invitees"}
            />
          </div>
          <div>
            <Button type="primary" icon="mail" style={{ marginTop: 28, marginBottom: 18, float: 'right' }} onClick={this.sendInvitation}>Send Invitation</Button>
          </div>
        </Col>
      </Row>
    )
  }
}


export { GroupSettingsSubtab }

