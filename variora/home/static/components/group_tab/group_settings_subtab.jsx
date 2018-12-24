import 'regenerator-runtime/runtime'

import {Col, Collapse, Icon, Popconfirm, Row, Tooltip} from 'antd'


import React from 'react'
import axios from 'axios'
import { getCookie } from 'util.js'


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

    const cardTitle = (
      <span style={{fontSize: '12px'}}>
        Invite new members
        <Tooltip title={'Or they can apply to join your group. Simply search the group name and click the apply button'} >
          <a href="#">
            <Icon type="info-circle-o" style={{marginLeft: 6}} />
          </a>
        </Tooltip>
      </span>
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
      </div>
    )
  }
}


export { GroupSettingsSubtab }

