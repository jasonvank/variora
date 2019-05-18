import 'regenerator-runtime/runtime'

import {Avatar, Badge, Col, Icon, Popover, Table, notification, Tabs, Tooltip} from 'antd'
import {getCookie, getUrlFormat, groupAvatarColors} from 'util.js'

import React from 'react'
import axios from 'axios'


class GroupAvatarWrapper extends React.Component {
  render() {
    if (this.props.coterie.avatarUrl !== undefined) {
      return <Avatar src={this.props.coterie.avatarUrl} style={{ verticalAlign: 'middle', background: 'white' }}></Avatar>
    } else if (this.props.coterie.icon !== undefined) {
      return <Avatar icon={this.props.coterie.icon} style={{ verticalAlign: 'middle'}}></Avatar>
    } else {
      const color = groupAvatarColors[this.props.coterie.uuid.charCodeAt(0) % 8]
      return (
        <Avatar style={{ backgroundColor: color, verticalAlign: 'middle' }}>
          <span style={{position: 'initial'}}>{this.props.coterie.name.slice(0, 2).toUpperCase()}</span>
        </Avatar>
      )
    }
  }
}


class GroupDetailsWrapper extends React.Component {
  render() {
    const description = this.props.coterie.description
    const name = this.props.coterie.name

    return (
      <div style={{cursor: 'pointer'}}>
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
      if (record.callback !== undefined) {
        record.callback()
      } else {
        window.location.href = `/groups/${record.uuid}/`
      }
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
    }, {
      title: 'in',
      key: 'in',
      width: '5%',
      render: (text, record, index) => (
        <Icon style={{verticalAlign: 'middle', display: record.uuid === this.props.currentCoterieUUID ? 'block' : 'none'}} type="check" />
      )
    }]

    const publicCoterie = [{
      uuid: undefined,
      name: 'Public',
      description: 'Public content is visible by all users',
      avatarUrl: '/media/logo.png'
    }]
    const createNewGroupFakeItem = {
      uuid: 'fake',
      name: 'New Group',
      description: 'Click to create a new group',
      icon: 'plus-square-o',
      callback: () => {this.props.setCreateCoterieModelVisible(true)}
    }
    return (
      <div id={'group-selection-div'} style={{maxHeight: '66vh', overflowY: 'auto' }}>
        <Table
          className='notification-table'
          dataSource={publicCoterie}
          columns={columns}
          pagination={false}
          showHeader={false}
          style={{width: '300px'}}
          rowKey={record => record.slug}
          onRowClick={() => {window.location.href = `/`}}
          footer={() => null}
          title={() => null}
          locale={{ emptyText: '', }}
        />
        <Table
          className='notification-table'
          dataSource={this.props.administratedCoteries.concat([createNewGroupFakeItem])}
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
    // axios.get('/coterie/api/coteries').then((response) => {
    //   this.setState({
    //     administratedCoteries: response.data.administratedCoteries,
    //     joinedCoteries: response.data.joinedCoteries
    //   })
    // })
  }

  render() {
    var iconToShow = (
      <Icon type="team"
        // onClick={() => {
        //   notification['info']({message: 'We are rewriting the group function, it will come soon.'})
        // }}
        style={{ cursor: 'pointer', fontSize: 18, marginLeft: 28, verticalAlign: 'middle' }}
      />
    )

    // if (this.props.currentCoterieUUID !== undefined) {
    //   var currentCoterie = undefined
    //
    //   var filtered = this.props.administratedCoteries.filter(c => c.uuid === this.props.currentCoterieUUID)
    //   if (filtered.length > 0)
    //     currentCoterie = filtered[0]
    //
    //   filtered = this.props.joinedCoteries.filter(c => c.uuid === this.props.currentCoterieUUID)
    //   if (filtered.length > 0)
    //     currentCoterie = filtered[0]
    //
    //   if (currentCoterie !== undefined) {
    //     const color = groupAvatarColors[this.props.currentCoterieUUID.charCodeAt(0) % 8]
    //     iconToShow = (
    //       <Avatar style={{ cursor: 'pointer', marginLeft: 28, backgroundColor: color, verticalAlign: 'middle' }} size='small'>
    //         <span style={{position: 'initial'}}>{currentCoterie.name.slice(0, 2).toUpperCase()}</span>
    //       </Avatar>
    //     )
    //   }
    // }

    return (
      <Popover
        content={
          <GroupsList
            administratedCoteries={this.props.administratedCoteries} joinedCoteries={this.props.joinedCoteries}
            setCreateCoterieModelVisible={this.props.setCreateCoterieModelVisible}
            currentCoterieUUID={this.props.currentCoterieUUID}
          />
        }
        trigger='click'
        visible={this.state.visible}
        onVisibleChange={this.handleVisibleChange}
        placement="bottom"
      >
        {/*{iconToShow}*/}
        <Tooltip title={'Documents and discussion inside a group is not visible to the world'} >
          <a href="#">
            <Icon type="info-circle-o" style={{marginRight: 6, verticalAlign: 'middle'}} />
          </a>
        </Tooltip>

        <span style={{ fontWeight: 400, color: '#666', cursor: 'pointer', verticalAlign: 'middle', marginRight: 6 }}>Groups</span>
        <Icon style={{ fontSize: 8, cursor: 'pointer', verticalAlign: 'middle' }} type="caret-down" />
      </Popover>
    )
  }
}

export { GroupSelectionButton }
