import 'antd/dist/antd.css';
import 'regenerator-runtime/runtime';

import { Avatar, Button, notification } from 'antd';
import { getCookie, getUrlFormat } from 'util.js'

import React from 'react';
import axios from 'axios'
import enUS from 'antd/lib/locale-provider/en_US';


class ReceivedCoterieInvitationNotificationContent extends React.Component {
  constructor(props) {
    super(props)
    this.onAcceptClick = this.onAcceptClick.bind(this)
    this.onRejectClick = this.onRejectClick.bind(this)
  }

  onAcceptClick() {
    notification.close(this.props.invitation.pk)
  };
  onRejectClick() {
    notification.close(this.props.invitation.pk)
  };

  render() {
    return (
      <div>
        <p></p>
        <Button style={{ margin: '12px 8px 6px 8px' }} type="primary" size="small" onClick={this.onAcceptClick}>
          Accept
        </Button>
        <Button style={{ margin: '12px 8px 6px 8px' }} type="primary" size="small" onClick={this.onRejectClick}>
          Reject
        </Button>
      </div>
    )
  }
}


class ReceivedCoterieInvitationNotifications extends React.Component {
  componentDidMount() {
    axios.get('/coterie/api/invitations').then(function(response) {
      for (var invitation of response.data) {
        notification.open({
          message: 'You have a new invitation!',
          description: <ReceivedCoterieInvitationNotificationContent invitation={invitation}/>,
          duration: 0,
          key: invitation.pk
        })
      }
    })
  }
  render() { return null }
}



export { ReceivedCoterieInvitationNotifications };












