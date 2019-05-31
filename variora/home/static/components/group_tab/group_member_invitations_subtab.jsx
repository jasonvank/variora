import 'regenerator-runtime/runtime'

import {Button, Card, Col, Collapse, Icon, Input, Layout, Menu, Popconfirm, Row, Tooltip, message, notification} from 'antd'
import { getCookie, getUrlFormat } from 'util.js'

import React from 'react'
import axios from 'axios'
import validator from 'email-validator'

const { TextArea } = Input

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
          duration: 2,
        })
        return
      }

      var data = new FormData()
      data.append('coterie_id', this.props.coteriePk)
      data.append('invitee_emails', emailList)
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
            message: 'Following emails are not registered yet. We already send email to them about your invitation.',
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
    var rows = emailsString.trim().split(/\n| /)
    var emailsArray = []
    for (var row of rows) {
      emailsArray = emailsArray.concat(row.trim().split(',').filter(element => element !== ''))
    }
    return emailsArray
  }

  _handleCopyPasteEmailsFromEmailClient(emailsString) {
    let resultArray = []
    // use regex to extract everything between each "< >"
    let matchesArray = emailsString.match(/<.+?>/g)
    // validate each extracted term to ensure valid email
    for (let index in matchesArray) {
      let match = matchesArray[index]
      let potentialEmailString = match.replace('<', '').replace('>', '')
      if (validator.validate(potentialEmailString) && !(resultArray.includes(potentialEmailString))) {
        resultArray.push(potentialEmailString)
      }
    }
    return resultArray
  }

  preprocessEmailsString(emailsString) {
    // handle copy paste from email client first
    var copyPasteEmailArray = this._handleCopyPasteEmailsFromEmailClient(emailsString)
    if (copyPasteEmailArray.length != 0) {
      return [true, copyPasteEmailArray.join(',')]
    }

    // do normal flow
    var emailArray = this._emailsStringToArray(emailsString)
    var returnedEmailArray = []
    for (var email of emailArray) {
      email = email.trim()
      if (!validator.validate(email))
        return [false, [email]]
      if (!returnedEmailArray.includes(email)) {
        returnedEmailArray.push(email)
      }
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


class GroupMemberInvitationsSubtab extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      coteriePk: this.props.coteriePk,
      coterieUUID: this.props.coterieUUID,
      join_code: undefined,
    }

    this.onClickNewJoinCode = () => {
      var data = new FormData()
      data.append('csrfmiddlewaretoken', getCookie('csrftoken'))
      axios.post('/coteries/api/coteries/{0}/joincodes/new'.format(this.state.coterieUUID), data).then(
        response => this.setState({join_code: response.data['new_code']})
      )
    }

    this.onClickDeleteJoinCode = () => {
      var data = new FormData()
      data.append('csrfmiddlewaretoken', getCookie('csrftoken'))
      axios.post('/coteries/api/coteries/{0}/joincodes/delete'.format(this.state.coterieUUID), data).then(
        response => this.setState({join_code: undefined})
      )
    }
  }

  componentWillReceiveProps(nextProps) {
    this.setState({
      coteriePk: nextProps.coteriePk,
      coterieUUID: this.props.coterieUUID,
    })
  }

  componentDidMount() {}

  render() {
    const inviteCardTitle = (
      <span style={{fontSize: '12px'}}>
        Invite new members
        <Tooltip title={'Or they can apply to join your group. Simply search the group name and click the apply button'} >
          <a href="#">
            <Icon type="info-circle-o" style={{marginLeft: 6}} />
          </a>
        </Tooltip>
      </span>
    )

    const joinCodeCardTitle = (
      <span style={{fontSize: '12px'}}> Manage group invitation code </span>
    )

    const invitationSection = (
      <div>
        <Card size="small" title={inviteCardTitle} className={'card'} bordered={false} style={{ overflow: 'auto', backgroundColor: 'white', margin: '18px 0 28px 0' }} noHovering>
          <GroupInvitationForm coteriePk={this.state.coteriePk}/>
        </Card>

        <Card size="small" title={joinCodeCardTitle} className={'card'} bordered={false} style={{ overflow: 'auto', backgroundColor: 'white', margin: '18px 0 28px 0' }} noHovering>
          <span style={{ marginLeft: 8, verticalAlign: 'middle' }}>
            Users can search the group name and join the group using the following invitation code
          </span>

          {
            this.state.join_code === undefined ?
            <p style={{ fontSize: 16, marginTop: 28, marginBottom: 28, marginLeft: 8, wordBreak: 'break-all', hyphens: 'auto' }}>
              No invitation code. Click 'New' button to generate one
            </p>
            :
            <p style={{ fontSize: 28, marginTop: 18, marginBottom: 18, marginLeft: 8, wordBreak: 'break-all', hyphens: 'auto' }}>
              {this.state.join_code}
            </p>
          }


          <div style={{ marginBottom: 18 }}>
            <Button type="primary" ghost icon="reload" onClick={this.onClickNewJoinCode} style={{ marginRight: 18 }}>New</Button>
            <Button type="danger" ghost icon="close" onClick={this.onClickDeleteJoinCode} style={{ marginRight: 18 }}>Delete</Button>
          </div>
        </Card>
      </div>
    )
    return (
      <div>
        { this.props.isAdmin ? invitationSection : null }
      </div>
    )
  }
}


export { GroupMemberInvitationsSubtab }
