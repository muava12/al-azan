package com.github.meypod.al_azan.modules;

import static com.github.meypod.al_azan.modules.MediaPlayerModule.ctx;
import static com.github.meypod.al_azan.utils.Utils.getIdFromRawResourceUri;

import android.content.Context;
import android.content.Intent;
import android.content.res.AssetFileDescriptor;
import android.content.res.Resources;
import android.media.AudioAttributes;
import android.media.AudioManager;
import android.media.AudioManager.OnAudioFocusChangeListener;
import android.media.MediaPlayer;
import android.net.Uri;
import android.os.Binder;
import android.os.Build.VERSION;
import android.os.Build.VERSION_CODES;
import android.os.IBinder;
import android.os.PowerManager;
import android.telephony.PhoneStateListener;
import android.telephony.TelephonyManager;

import androidx.annotation.Nullable;

import com.facebook.react.HeadlessJsTaskService;
import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.Promise;
import com.facebook.react.jstasks.HeadlessJsTaskConfig;
import com.facebook.react.modules.core.DeviceEventManagerModule;

public class MediaPlayerService extends HeadlessJsTaskService implements
    MediaPlayer.OnCompletionListener, MediaPlayer.OnPreparedListener, MediaPlayer.OnErrorListener,
    OnAudioFocusChangeListener {

  private static final String STATE_STOPPED = "stopped";
  private static final String STATE_STARTED = "started";
  private static final String STATE_PAUSED = "paused";


  private MediaPlayer player;
  private boolean wasPlaying = false;
  private boolean isStarted = false;
  private boolean isPaused = false;
  private Promise setDataSourcePromise = null;
  private TelephonyManager telephonyManager;
  private TelephonyStateListener telephonyStateListener;
  private PhoneStateListener phoneStateListener;
  private int currentState = TelephonyManager.CALL_STATE_IDLE;

  @Nullable
  @Override
  protected HeadlessJsTaskConfig getTaskConfig(Intent intent) {
    return new HeadlessJsTaskConfig("MediaPlayer", Arguments.createMap(), 0, true);
  }

  @Override
  public void onHeadlessJsTaskFinish(int taskId) {
    // Overridden to prevent the service from being terminated
  }

  @Override
  public void onAudioFocusChange(int focusChange) {
    ctx.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
        .emit("audio_focus_change", focusChange);
    if (focusChange > 0) {
      if (wasPlaying) {
        start(true);
      }
    } else if (focusChange == AudioManager.AUDIOFOCUS_LOSS) {
      if (currentState == TelephonyManager.CALL_STATE_IDLE) {
        stop();
      }
    }
  }

  public boolean isPlaying() {
    if (player != null) {
      return player.isPlaying();
    }
    return false;
  }

  public void pause() {
    try {
      player.pause();
    } catch (Exception ignored) {
    } finally {
      if (isStarted) {
        wasPlaying = true;
      }
      isPaused = true;
      ctx.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
          .emit("state", STATE_PAUSED);
    }
  }

  public void stop() {
    try {
      player.stop();
    } catch (Exception ignored) {
    } finally {
      onCompletion(player);
      ctx.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
          .emit("state", STATE_STOPPED);
    }
  }


  public void start(boolean skipCheck) {
    AudioManager audioManager = (AudioManager) getSystemService(AUDIO_SERVICE);
    if (!skipCheck) {
      if (currentState != TelephonyManager.CALL_STATE_IDLE) {
        pause();
        return;
      }
    }
    try {
      int access = skipCheck ? AudioManager.AUDIOFOCUS_REQUEST_GRANTED
          : audioManager.requestAudioFocus(this, AudioManager.STREAM_ALARM,
              AudioManager.AUDIOFOCUS_GAIN);
      if (access == AudioManager.AUDIOFOCUS_REQUEST_GRANTED) {
        player.start();
        isStarted = true;
        isPaused = false;
        wasPlaying = false;
        ctx.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
            .emit("state", STATE_STARTED);
      } else {
        isStarted = true;
        wasPlaying = true;
        isPaused = true;
      }
    } catch (Exception ignored) {
      audioManager.abandonAudioFocus(this);
    }
  }


  public String getState() {
    if (isPaused) {
      return "paused";
    }
    if (isPlaying()) {
      return "started";
    }
    return "stopped";
  }


  public void setVolume(float volume) {
    try {
      player.setVolume(volume, volume);
    } catch (Exception ignored) {
    }
  }


  public void setDataSource(Uri uri, Promise promise) {
    if (setDataSourcePromise != null) {
      promise.reject("ERROR", "A setDataSource Call is already pending");
      return;
    }
    try {
      setDataSourcePromise = promise;
      player.reset();
      int id = getIdFromRawResourceUri(uri);
      if (id > 0) {
        try {
          AssetFileDescriptor afd = getResources().openRawResourceFd(id);
          if (afd == null) {
            throw new Exception("file is compressed");
          }
          player.setDataSource(afd.getFileDescriptor(), afd.getStartOffset(),
              afd.getLength());
          afd.close();
        } catch (Resources.NotFoundException e) {
          throw new Exception("resource with id " + id + " not found");
        }
      } else {
        player.setDataSource(ctx, uri);
      }

      player.prepareAsync();
    } catch (Exception e) {
      promise.reject("ERROR", "setDataSource: " + e.getLocalizedMessage());
      setDataSourcePromise = null;
    }
  }

  public void setupPlayer() {
    releasePlayer();
    setupCallStateListener();

    player = new MediaPlayer();
    player.setWakeMode(getApplicationContext(), PowerManager.PARTIAL_WAKE_LOCK);
    player.setAudioAttributes(
        new AudioAttributes.Builder()
            .setContentType(AudioAttributes.CONTENT_TYPE_MUSIC)
            .setUsage(AudioAttributes.USAGE_ALARM)
            .build()
    );
    player.setOnErrorListener(this);
    player.setOnPreparedListener(this);
    player.setOnCompletionListener(this);
  }

  @Nullable
  @Override
  public IBinder onBind(Intent intent) {
    return new MusicBinder();
  }

  @Override
  public boolean onError(MediaPlayer mp, int what, int extra) {
    isStarted = false;
    isPaused = false;
    wasPlaying = false;

    String error = "";
    switch (extra) {
      case MediaPlayer.MEDIA_ERROR_IO:
        error = "IO";
        break;
      case MediaPlayer.MEDIA_ERROR_MALFORMED:
        error = "MALFORMED";
        break;
      case MediaPlayer.MEDIA_ERROR_UNSUPPORTED:
        error = "UNSUPPORTED";
        break;
      case MediaPlayer.MEDIA_ERROR_TIMED_OUT:
        error = "TIMED_OUT";
        break;
      default:
        error = "UNKNOWN";
        break;
    }
    ctx.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
        .emit("error", error);
    return true;
  }

  @Override
  public void onPrepared(MediaPlayer mp) {
    if (setDataSourcePromise != null) {
      setDataSourcePromise.resolve(null);
      setDataSourcePromise = null;
    }
  }

  @Override
  public void onCompletion(MediaPlayer mp) {
    isStarted = false;
    isPaused = false;
    wasPlaying = false;
    AudioManager audioManager = (AudioManager) getSystemService(AUDIO_SERVICE);
    audioManager.abandonAudioFocus(this);
    ctx.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
        .emit("completed", null);
    ctx.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
        .emit("state", STATE_STOPPED);
  }

  class MusicBinder extends Binder {

    MediaPlayerService service = MediaPlayerService.this;
  }


  private void setupCallStateListener() {
    if (telephonyManager == null) {
      telephonyManager = (TelephonyManager) ctx.getSystemService(Context.TELEPHONY_SERVICE);
      if (VERSION.SDK_INT >= VERSION_CODES.S) {
        telephonyStateListener = new TelephonyStateListener(
            this::onNewCallState);
        telephonyManager.registerTelephonyCallback(
            ctx.getMainExecutor(),
            telephonyStateListener
        );
      } else {
        phoneStateListener = new PhoneStateListener() {
          @Override
          public void onCallStateChanged(int newState, String _unused_incomingNumber) {
            onNewCallState(newState);
          }
        };
        telephonyManager.listen(phoneStateListener, PhoneStateListener.LISTEN_CALL_STATE);
      }
    }
  }

  private void onNewCallState(int newState) {
    currentState = newState;
    if (newState == TelephonyManager.CALL_STATE_IDLE && wasPlaying) {
      start(false);
    } else if (
        newState == TelephonyManager.CALL_STATE_RINGING ||
            newState == TelephonyManager.CALL_STATE_OFFHOOK
    ) {
      if (isStarted && !isPaused) {
        pause();
      }
    }
  }


  private void destroyCallStateListener() {
    if (telephonyManager != null) {
      if (VERSION.SDK_INT >= VERSION_CODES.S) {
        telephonyManager.unregisterTelephonyCallback(telephonyStateListener);
        telephonyStateListener = null;
      } else {
        telephonyManager.listen(phoneStateListener, PhoneStateListener.LISTEN_NONE);
        phoneStateListener = null;
      }
      telephonyManager = null;
    }
  }

  public void destroy() {
    releasePlayer();
    destroyCallStateListener();
    stopForeground(true);
    stopSelf();
  }

  public void releasePlayer() {
    if (player != null) {
      player.stop();
      player.release();
      player = null;
    }
  }
}
