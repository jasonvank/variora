import 'regenerator-runtime/runtime'

import {Avatar, Badge, Col, Icon, Popover, Table, notification, Tabs } from 'antd'
import {getCookie, getUrlFormat, groupAvatarColors} from 'util.js'

import React from 'react'
import axios from 'axios'


class GroupAvatarWrapper extends React.Component {
  render() {
    const color = groupAvatarColors[this.props.coterie.uuid.charCodeAt(0) % 8];
    return (
      <Avatar style={{ backgroundColor: color, verticalAlign: 'middle' }}>
        <span style={{position: 'initial'}}>{this.props.coterie.name.slice(0, 2).toUpperCase()}</span>
      </Avatar>
    )
  }
}


class GroupDetailsWrapper extends React.Component {
  render() {
    const description = this.props.coterie.description
    const name = this.props.coterie.name

    return (
      <div>
        <div className={'group-name'}>{name}</div>
        { description.length === 0 ? null :
          <div className="notification-alert-list-wrapper" title={description}>{description}</div>
        }
        {/*<TimeAgo style={{color: '#91959d'}} date={this.state.newNotification.timestamp} />*/}
      </div>
    )
  }
}


class GroupsList extends React.Component {
  constructor(props) {
    super(props)

    this.onClickRow = (record, index, event) => {
      window.location.href = `/groups/${record.uuid}/`
    }
  }

  render() {
    const columns = [{
      title: 'Avatar',
      key: 'avatar',
      width: '20%',
      render: (text, record, index) => (
        <GroupAvatarWrapper coterie={record} />
      )
    }, {
      title: 'title',
      key: 'title',
      width: '75%',
      render: (text, record, index) => (
        <GroupDetailsWrapper coterie={record} />
      )
    }]

    return (
      <div id={'group-selection-div'} style={{maxHeight: '66vh', overflowY: 'auto' }}>
        <Table
          className='notification-table'
          dataSource={this.props.administratedCoteries}
          columns={columns}
          pagination={false}
          showHeader={false}
          style={{width: '300px'}}
          rowKey={record => record.slug}
          onRowClick={this.onClickRow}
          footer={() => null}
          title={() => <span style={{height: 18, }}>As admin</span>}
          locale={{ emptyText: '', }}
        />
        <Table
          className='notification-table'
          dataSource={this.props.joinedCoteries}
          columns={columns}
          pagination={false}
          showHeader={false}
          style={{width: '300px'}}
          rowKey={record => record.slug}
          onRowClick={this.onClickRow}
          footer={() => null}
          title={() => <span style={{height: 18, }}>As member</span>}
          locale={{ emptyText: '', }}
        />
      </div>
    )
  }
}


class GroupSelectionButton extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      visible: false,
      length: undefined,
      show: false,
      data: undefined
    }
    this.handleVisibleChange = (visible) => {
      this.setState({visible})
    }
  }

  componentDidMount() {
    axios.get('/coterie/api/coteries').then((response) => {
      this.setState({
        administratedCoteries: response.data.administratedCoteries,
        joinedCoteries: response.data.joinedCoteries
      })
    })
  }

  render() {
    return (
      <Popover
        content={
          <GroupsList administratedCoteries={this.state.administratedCoteries} joinedCoteries={this.state.joinedCoteries} />
        }
        trigger='click'
        visible={this.state.visible}
        onVisibleChange={this.handleVisibleChange}
      >
        <Icon type="team"
          // onClick={() => {
          //   notification['info']({message: 'We are rewriting the group function, it will come soon.'})
          // }}
          style={{ cursor: 'pointer', fontSize: 18, marginLeft: 28, verticalAlign: 'middle' }}
        />
      </Popover>
    )
  }
}

export { GroupSelectionButton }
