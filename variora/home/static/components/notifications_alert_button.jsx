import 'regenerator-runtime/runtime'

import {Avatar, Badge, Button, Icon, notification, Popover, Table} from 'antd'
import {getCookie, getUrlFormat} from 'util.js'

import React from 'react'
import axios from 'axios'

class NotificationsAvaratWrapper extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      newNotification: this.props.newNotification
    }
  }

  render() {
    var defaultAvatarUrl = '/media/default_notification_img.png'
    var defaultAvatar = <Avatar src={defaultAvatarUrl} style={{verticalAlign: 'middle', background: 'white'}}></Avatar>
    var userAvatar = <Avatar src={this.state.newNotification.data.image_url} style={{verticalAlign: 'middle', background: 'white'}}></Avatar>
    return (
      this.state.newNotification.data.image_url ? userAvatar : defaultAvatar
    )
  }
}

class NotificationsDetailsWrapper extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      newNotification: this.props.newNotification
    }
  }

  render() {
    var description = this.state.newNotification.description
    var time = this.state.newNotification.timestamp.replace('T', ' ').split('.')[0]
    var verb = ''
    var actionVerb = this.state.newNotification.verb
    if (actionVerb == 'reply to annotation reply') verb = 'replied'
    else if (actionVerb == 'reply to annotation') verb = 'replied'
    var title = this.state.newNotification.actor + ' ' + verb

    return (
      <div>
        <div style={{fontWeight: 'bold'}}><a target="_blank" href={this.state.newNotification.data.redirect_url} style={{textDecoration: 'none'}}>{title}</a></div>
        <div className="notification-alert-list-wrapper" title={description}>{description}</div>
        <div style={{color: '#91959d'}}>{time}</div>
      </div>
    )
  }
}


class NotificationsList extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      data: undefined
    }

    this.handleReadStatus = (record, index, event) => {
      axios.get(record.mark_read_url)
      var data = new FormData()
      data.append('csrfmiddlewaretoken', getCookie('csrftoken'))
      axios.post('notifications/api/unread', data).then(() => {
        var newData = this.state.data
        newData[index].unread = false
        this.setState({data: newData})
      })
    }
  }

  componentDidMount() {
    const self = this
    axios.get(getUrlFormat('/notifications/api/unread'))
      .then(response => {
        self.setState({
          data: response.data
        })
      })
  }

  render() {
    const columns = [{
      title: 'Avatar',
      key: 'avatar',
      width: '20%',
      render: (text, record, index) => (
        <NotificationsAvaratWrapper newNotification={record}/>
      )
    }, {
      title: 'title',
      key: 'title',
      width: '75%',
      render: (text, record, index) => (
        <NotificationsDetailsWrapper newNotification={record}/>
      )
    }, {
      title: 'Read',
      key: 'read',
      width: '5%',
      render: (text, record, index) => (
        <Badge style={{verticalAlign: 'middle'}} status={record.unread ? 'processing' : 'default'}/>
      )
    }]

    return (
      <Table
        dataSource={this.state.data}
        columns={columns}
        pagination={false}
        showHeader={false}
        scroll={{y: 600}}
        style={{width: '300px'}}
        rowKey={record => record.slug}
        onRowClick={this.handleReadStatus}
      />
    )
  }
}


class NotificationsAlertButton extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      visible: false
    }
    this.handleVisibleChange = (visible) => {
      this.setState({visible})
    }
  }

  render() {
    return (
      <Popover
        content={<NotificationsList data={this.state.data}/>}
        trigger="click"
        visible={this.state.visible}
        onVisibleChange={this.handleVisibleChange}
      >
        <Icon type="bell" style={{cursor: 'pointer', fontSize: 18, marginLeft: 28, verticalAlign: 'middle', marginTop: -2}}
        />
      </Popover>
    )
  }
}

export { NotificationsAlertButton }



