import 'antd/dist/antd.css';
import 'regenerator-runtime/runtime';

import { Button, Col, Icon, Input, Layout, Menu, Popconfirm, Row, notification } from 'antd';
import {
  Link,
  Route,
  BrowserRouter as Router
} from 'react-router-dom'

import React from 'react';
import axios from 'axios'
import enUS from 'antd/lib/locale-provider/en_US';
import { getCookie } from 'util.js'
import validator from 'email-validator'

const { SubMenu } = Menu;
const { Header, Content, Sider } = Layout;
const { TextArea } = Input;
const MenuItemGroup = Menu.ItemGroup;


class GroupSettingsSubtab extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      'coteriePk': props.coteriePk
    }
    this.deleteGroup = () => {
      var self = this
      var data = new FormData()
      data.append('csrfmiddlewaretoken', getCookie('csrftoken'))
      axios.post('/coterie/api/coteries/' + this.state.coteriePk + '/delete', data).then(function () {
        self.props.deleteCoterieCallback(self.state.coteriePk)
      })
    }
  }

  componentWillReceiveProps(nextProps) {
    this.setState({
      coteriePk: nextProps.coteriePk
    })
  }

  render() {
    return (
      <div>
        <Popconfirm
          title="Are you sure to delete this group? This cannot be undone."
          onConfirm={() => this.deleteGroup()}
          okText="Yes" cancelText="No"
        >
          <Button>Delete</Button>
        </Popconfirm>

        <div>
          <div style={{ backgroundColor: 'white', margin: '28px 0 28px 0', boxShadow: '2px 3px 8px rgba(0, 0, 0, .25)' }}>
            <GroupInvitationForm coteriePk={this.state.coteriePk}/>
          </div>
        </div>

      </div>
    )
  }
}

class ResponseNotificationWrapper extends React.Component {
  render() {
    var data = this.props.response.data
    var emailListItems = data.map(function(invitation) {
      return <li key = {invitation.pk} ><p>{invitation.invitee_nickname + '  '}<code>{'<' + invitation.invitee_email + '>'}</code></p></li>
    })

    return (
      <div>
        to<br />
        <ul>
          {emailListItems}
        </ul>
      </div>
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
      if (!this.validateEmailListInput(this.state.emailList)) {
        notification['warning']({
          message: 'Email list input is not valid',
          description: 'Please check again!',
          duration: 2
        });
        return
      }
      var data = new FormData()
      data.append('coterie_id', this.props.coteriePk)
      data.append('invitee_emails', this.state.emailList)
      data.append('invitation_message', this.state.invitationMessage)
      data.append('csrfmiddlewaretoken', getCookie('csrftoken'))
      axios.post('/coterie/api/invite', data).then((response) => {
        notification['success']({
          message: 'Invitations successfully sent',
          description: <ResponseNotificationWrapper response={response}/>,
          duration: 0
        });
      })
    }

    this.onEmailListInputChange = this.onEmailListInputChange.bind(this)
    this.onInvitationMessageInputChange = this.onInvitationMessageInputChange.bind(this)
  }

  async onEmailListInputChange(e) {
    await this.setState({ emailList: e.target.value });
  }

  async onInvitationMessageInputChange(e) {
    await this.setState({ invitationMessage: e.target.value });
  }

  validateEmailListInput(emailList) {
    var emailArray = emailList.trim().split(',')
    for (var email of emailArray) {
      email = email.trim()
      if (!validator.validate(email))
        return false
    }
    return true
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







