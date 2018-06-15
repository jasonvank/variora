import 'antd/dist/antd.css';
import 'regenerator-runtime/runtime';

import { Avatar, Badge, Button, notification } from 'antd';
import { getCookie, getUrlFormat } from 'util.js'

import React from 'react';
import axios from 'axios'



class InvitationDetailsWrapper extends React.Component{
  render() {
    var message = this.props.invitation
    var messageListItems =
      <p>Invitation from Group: {message.coterie_name}
        <br />
        { message.invitation_message }
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
    // this.invitationDetails = this.invitationDetails.bind(this)
  }

  // invitationDetails() {
  //   var messageDetails = this.props.invitation
  //   console.log(messageDetails)
  //   this.setState ({
  //     message :
  //     <p>Invitation from Group: {messageDetails.coterie_name}
  //       <br />
  //       { messageDetails.invitation_message }
  //     </p>
  //   })
  // }

  onAcceptClick() {
    console.log("Accept post: ", this.props.invitation.accept_url),
    notification.close(this.props.invitation.pk)
  }

  onRejectClick() {
    console.log("Reject post: ", this.props.invitation.reject_url),
    notification.close(this.props.invitation.pk)
  }

  render() {
    return (
      <div>
      <InvitationDetailsWrapper invitation={this.props.invitation}/>
        {/* <p>Invitation from Group: {this.props.invitation.coterie_name} <br /> { this.props.invitation.invitation_message }</p> */}
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


class AvatarWithNotifications extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      invitations: undefined,
      showNotifications: false
    }

    this.onClick = () => {
      if (this.state.invitations == undefined)
        return
      var show = !this.state.showNotifications
      if (show)
        this.displayInvitations(this.state.invitations)
      else
        for (var invitation of this.state.invitations)
          notification.close(invitation.pk)
      this.setState({ showNotifications: show })
    }
  }

  displayInvitations(invitations) {
    notification.config({ top: 60 })
    for (var invitation of invitations) {
      notification.open({
        message: 'You have a new invitation!',
        description: <ReceivedCoterieInvitationNotificationContent invitation={invitation} />,
        duration: 0,
        key: invitation.pk,
      })
    }
  }

  componentDidMount() {
    var self = this
    axios.get('/coterie/api/invitations').then(function(response) {
      self.setState({ invitations: response.data })
      // self.displayInvitations(response.data)
    })
  }

  render() {
    return (
      <Badge count={this.state.invitations == undefined ? 0 : this.state.invitations.length}
        style={{ backgroundColor: '#F89406' }}>
      <Avatar
        style={{ cursor: 'pointer', verticalAlign: 'middle' }}
        size={'large'}
        src={this.props.avatarSrc}
        onClick={this.onClick}
      />
      </Badge>
    )
  }
}



export { AvatarWithNotifications };



