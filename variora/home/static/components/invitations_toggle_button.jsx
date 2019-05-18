import 'regenerator-runtime/runtime'

import { Badge, Button, Icon, notification } from 'antd'
import { getCookie, getUrlFormat } from 'util.js'

import React from 'react'
import axios from 'axios'

class InvitationDetailsWrapper extends React.Component{
  render() {
    var message = this.props.invitation
    var messageListItems =
      <p>
        Group name: <b>{message.coterie_name}</b><br />
        Message: { message.invitation_message }
      </p>

    return (
      <div>
        {messageListItems}
      </div>
    )
  }
}

class ReceivedCoterieInvitationNotificationContent extends React.Component {
  constructor(props) {
    super(props)
    this.onAcceptClick = this.onAcceptClick.bind(this)
    this.onRejectClick = this.onRejectClick.bind(this)
  }

  onAcceptClick() {
    var self = this
    var data = new FormData()
    data.append('csrfmiddlewaretoken', getCookie('csrftoken'))
    axios.post(this.props.invitation.accept_url, data).then((response) => {
      notification.close(self.props.invitation.pk)
      self.props.updateLeftInvitationsCallback(self.props.invitation.pk)
      self.props.acceptInvitationCallback(self.props.invitation.coterie_pk)
    })
  }

  onRejectClick() {
    var self = this
    var data = new FormData()
    data.append('csrfmiddlewaretoken', getCookie('csrftoken'))
    axios.post(this.props.invitation.reject_url, data).then((response) => {
      notification.close(self.props.invitation.pk)
      self.props.updateLeftInvitationsCallback(self.props.invitation.pk)
    })
  }

  render() {
    return (
      <div>
        <InvitationDetailsWrapper invitation={this.props.invitation}/>
        <div>
          <Button style={{ margin: '12px 8px 6px 8px' }} type="primary" size="small" onClick={this.onAcceptClick}>
            Accept
          </Button>
          <Button style={{ margin: '12px 8px 6px 8px' }} type="primary" size="small" onClick={this.onRejectClick}>
            Reject
          </Button>
        </div>
      </div>
    )
  }
}

class InvitationsToggleButton extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      invitations: undefined,
      showNotifications: false,
      user: props.user
    }

    this.onClick = () => {
      if (this.state.invitations == undefined || this.state.invitations.length == 0) {
        notification['info']({
          message: 'You do not have new group invitations.',
          duration: 3.8,
        })
      }
      const show = !this.state.showNotifications
      if (show)
        this.displayInvitations(this.state.invitations)
      else
        for (var invitation of this.state.invitations)
          notification.close(invitation.pk)
      this.setState({ showNotifications: show })
    }

    this.updateLeftInvitationsCallback = this.updateLeftInvitationsCallback.bind(this)
  }

  componentWillReceiveProps(nextProps) {
    this.setState({ ...nextProps })
    if (this.state.invitations == undefined && nextProps.user != undefined) {
      var self = this
      axios.get(getUrlFormat('/coterie/api/invitations', {
        'to': nextProps.user.email_address
      })).then(function(response) {
        self.setState({ invitations: response.data })
      })
    }
  }

  displayInvitations(invitations) {
    // notification.config({ top: 66 })
    for (var invitation of invitations) {
      notification.open({
        message: 'You have a new invitation!',
        description: <ReceivedCoterieInvitationNotificationContent invitation={invitation} acceptInvitationCallback={this.props.acceptInvitationCallback} updateLeftInvitationsCallback={this.updateLeftInvitationsCallback} />,
        duration: 0,
        key: invitation.pk,
      })
    }
  }

  updateLeftInvitationsCallback(invitationPkID) {
    var updatedInvitations = this.state.invitations.filter(function(invitation) {return invitation.pk != invitationPkID} )
    this.setState(
      {invitations: updatedInvitations}
    )
  }

  render() {
    return (
      <Badge
        count={this.state.invitations == undefined ? 0 : this.state.invitations.length}
        style={{ cursor: 'pointer', backgroundColor: '#FABE58', marginTop: -5 }}
        onClick={this.onClick}
      >
        <Icon type="inbox"
          style={{ cursor: 'pointer', fontSize: 18, marginLeft: 28, verticalAlign: 'middle', marginTop: -1 }}
        />
      </Badge>
    )
  }
}

export { InvitationsToggleButton }



