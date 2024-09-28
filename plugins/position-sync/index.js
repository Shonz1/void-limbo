/// <reference path="../global.d.ts" />

eventManager
  .subscribe('player-position-update', async event => {
    const { connection, position } = event;

    const positionAndRotation = connection.getPositionAndRotation();

    let deltaX = 0;
    let deltaY = 0;
    let deltaZ = 0;

    if ('x' in position) {
      deltaX = (position.x * 32 - positionAndRotation.x * 32) * 128;
      positionAndRotation.x = position.x;
    }

    if ('y' in position) {
      deltaY = (position.y * 32 - positionAndRotation.y * 32) * 128;
      positionAndRotation.y = position.y;
    }

    if ('z' in position) {
      deltaZ = (position.z * 32 - positionAndRotation.z * 32) * 128;
      positionAndRotation.z = position.z;
    }

    if ('yaw' in position) {
      positionAndRotation.yaw = Math.round((position.yaw * 256) / 360) & 0xff;
    }

    if ('pitch' in position) {
      positionAndRotation.pitch = Math.round((position.pitch * 256) / 360) & 0xff;
    }

    if ('onGround' in position) {
      positionAndRotation.onGround = position.onGround;
    }

    if (('yaw' in position || 'pitch' in position) && (deltaX !== 0 || deltaY !== 0 || deltaZ !== 0)) {
      for (const otherConnection of connection.constructor.getConnections()) {
        if (otherConnection === connection) {
          continue;
        }

        if (otherConnection.getPhase() !== network.Phase.PLAY) {
          continue;
        }

        await eventManager.fire('send-update-entity-position-and-rotation', {
          connection: otherConnection,
          entityId: connection.getId(),
          deltaX,
          deltaY,
          deltaZ,
          yaw: positionAndRotation.yaw,
          pitch: positionAndRotation.pitch,
          onGround: positionAndRotation.onGround,
        });
      }
    } else if (deltaX !== 0 || deltaY !== 0 || deltaZ !== 0) {
      for (const otherConnection of connection.constructor.getConnections()) {
        if (otherConnection === connection) {
          continue;
        }

        if (otherConnection.getPhase() !== network.Phase.PLAY) {
          continue;
        }

        await eventManager.fire('send-update-entity-position', {
          connection: otherConnection,
          entityId: connection.getId(),
          deltaX,
          deltaY,
          deltaZ,
          onGround: positionAndRotation.onGround,
        });
      }
    } else if ('yaw' in position || 'pitch' in position) {
      for (const otherConnection of connection.constructor.getConnections()) {
        if (otherConnection === connection) {
          continue;
        }

        if (otherConnection.getPhase() !== network.Phase.PLAY) {
          continue;
        }

        await eventManager.fire('send-update-entity-rotation', {
          connection: otherConnection,
          entityId: connection.getId(),
          yaw: positionAndRotation.yaw,
          pitch: positionAndRotation.pitch,
          onGround: positionAndRotation.onGround,
        });
      }
    }
  })
  .subscribe('connection-closed', async event => {
    const { connection } = event;

    for (const otherConnection of connection.constructor.getConnections()) {
      if (otherConnection === connection) {
        continue;
      }

      if (otherConnection.getPhase() !== network.Phase.PLAY) {
        continue;
      }

      await eventManager.fire('send-remove-entity', {
        connection: otherConnection,
        entityId: connection.getId(),
        gameProfile: connection.getGameProfile(),
      });
    }
  });
