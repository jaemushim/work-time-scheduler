import React, { Component } from "react";
import "./style.css";
import { Check, Pause, Play, Repeat } from "lucide-react";
import { Button } from "../button";

interface StopwatchState {
  timerOn: boolean;
  timerStart: number;
  timerTime: number;
}

class Stopwatch extends Component<any, StopwatchState> {
  timer: NodeJS.Timeout | undefined;

  constructor(props: {}) {
    super(props);
    this.state = {
      timerOn: false,
      timerStart: 0,
      timerTime: 0,
    };
  }

  startTimer = () => {
    this.setState({
      timerOn: true,
      timerTime: this.state.timerTime,
      timerStart: Date.now() - this.state.timerTime,
    });
    this.timer = setInterval(() => {
      this.setState({
        timerTime: Date.now() - this.state.timerStart,
      });
    }, 50);
  };

  stopTimer = () => {
    this.setState({ timerOn: false });
    if (this.timer) {
      clearInterval(this.timer);
    }
  };

  resetTimer = () => {
    this.props.onSave(this.state.timerTime);
    this.setState({
      timerStart: 0,
      timerTime: 0,
    });
  };

  render() {
    const { timerTime } = this.state;
    let centiseconds = ("0" + (Math.floor(timerTime / 10) % 100)).slice(-2);
    let seconds = ("0" + (Math.floor(timerTime / 1000) % 60)).slice(-2);
    let minutes = ("0" + (Math.floor(timerTime / 60000) % 60)).slice(-2);
    let hours = ("0" + Math.floor(timerTime / 3600000)).slice(-2);
    return (
      <div
        {...this.props}
        className={`Stopwatch ${(this.props as any).className}`}
      >
        <div className="Stopwatch-display mb-2">
          {hours} : {minutes} : {seconds} :{" "}
          <span className="w-[60px]">{centiseconds}</span>
        </div>
        <div className="flex justify-center gap-3">
          {this.state.timerOn === false && this.state.timerTime === 0 && (
            <Button variant="ghost" size="sm" onClick={this.startTimer}>
              <Play />
            </Button>
          )}
          {this.state.timerOn === true && (
            <Button variant="ghost" size="sm" onClick={this.stopTimer}>
              <Pause />
            </Button>
          )}
          {this.state.timerOn === false && this.state.timerTime > 0 && (
            <Button variant="ghost" size="sm" onClick={this.startTimer}>
              <Repeat />
            </Button>
          )}
          {this.state.timerOn === false && this.state.timerTime > 0 && (
            <Button variant="ghost" size="sm" onClick={this.resetTimer}>
              <Check className="text-green-500" />
            </Button>
          )}
        </div>
      </div>
    );
  }
}

export default Stopwatch;
