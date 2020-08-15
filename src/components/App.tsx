import { hot } from 'react-hot-loader/root'
import React from 'react'
import { Redirect, Route, Switch } from 'react-router-dom'

import JoinRoomPage from './pages/joinRoom/JoinRoomPage'
import RoomPage from './pages/room/RoomPage'

const App = () => {
  return (
    <div className="app">
      <Switch>
        <Route path="/create-room">
          <JoinRoomPage isCreation={true} />
        </Route>
        <Route path="/join-room">
          <JoinRoomPage />
        </Route>
        <Route path="/room/:id">
          <RoomPage />
        </Route>

        <Redirect to="/join-room" />
      </Switch>
    </div>
  )
}

export default hot(App)
