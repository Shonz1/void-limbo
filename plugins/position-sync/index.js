/// <reference path="../global.d.ts" />

api.eventManager
  .subscribe('player-position-update', async event => {
    const { player, position } = event;

    const positionAndRotation = player.getPositionAndRotation();

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
      for (const otherPlayer of api.Player.getPlayers()) {
        if (otherPlayer === player) {
          continue;
        }

        const otherChannel = otherPlayer.getChannel();

        if (otherChannel.getPhase() !== api.Phase.PLAY) {
          continue;
        }

        await api.eventManager.fire('send-update-entity-position-and-rotation', {
          channel: otherChannel,
          entityId: player.getId(),
          deltaX,
          deltaY,
          deltaZ,
          yaw: positionAndRotation.yaw,
          pitch: positionAndRotation.pitch,
          onGround: positionAndRotation.onGround,
        });
      }
    } else if (deltaX !== 0 || deltaY !== 0 || deltaZ !== 0) {
      for (const otherPlayer of api.Player.getPlayers()) {
        if (otherPlayer === player) {
          continue;
        }

        const otherChannel = otherPlayer.getChannel();

        if (otherChannel.getPhase() !== api.Phase.PLAY) {
          continue;
        }

        await api.eventManager.fire('send-update-entity-position', {
          channel: otherChannel,
          entityId: player.getId(),
          deltaX,
          deltaY,
          deltaZ,
          onGround: positionAndRotation.onGround,
        });
      }
    } else if ('yaw' in position || 'pitch' in position) {
      for (const otherPlayer of api.Player.getPlayers()) {
        if (otherPlayer === player) {
          continue;
        }

        const otherChannel = otherPlayer.getChannel();

        if (otherChannel.getPhase() !== api.Phase.PLAY) {
          continue;
        }

        await api.eventManager.fire('send-update-entity-rotation', {
          channel: otherChannel,
          entityId: player.getId(),
          yaw: positionAndRotation.yaw,
          pitch: positionAndRotation.pitch,
          onGround: positionAndRotation.onGround,
        });
      }
    }
  })
  .subscribe('connection-closed', async event => {
    const { channel } = event;
    const player = channel.getAssociation();

    for (const otherPlayer of api.Player.getPlayers()) {
      if (otherPlayer === player) {
        continue;
      }

      const otherChannel = otherPlayer.getChannel();

      if (otherChannel.getPhase() !== api.Phase.PLAY) {
        continue;
      }

      await api.eventManager.fire('send-remove-entity', {
        channel: otherChannel,
        entityId: player.getId(),
        gameProfile: player.getGameProfile(),
      });
    }
  });
