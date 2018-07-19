/* KokoaNLP
Copyright (C) 2018  Seungjae Park

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program.  If not, see <http://www.gnu.org/licenses/>. */

/**
 * Class representing a model.
 */
class Engine {
  /**
   * Loads the engine instance from the given file.
   * @abstract
   */
  static load() {
    throw new Error('Must be implemented by subclass!');
  }

  /**
   * Parses the given string to the engine instance.
   * @abstract
   */
  static parse() {
    throw new Error('Must be implemented by subclass!');
  }

  /**
   * Returns the enigne output from the given data.
   * @abstract
   */
  run() {
    throw new Error('Must be implemented by subclass!');
  }

  /**
   * Saves the engine instance as a file.
   * @abstract
   */
  save() {
    throw new Error('Must be implemented by subclass!');
  }

  /**
   * Returns the engine instance as a string.
   * @abstract
   */
  stringify() {
    throw new Error('Must be implemented by subclass!');
  }

  /**
   * Trains the given data.
   * @abstract
   */
  train() {
    throw new Error('Must be implemented by subclass!');
  }

  /**
   * Updates calculated value for each data.
   * @abstract
   */
  update() {
    throw new Error('Must be implemented by subclass!');
  }
}

module.exports = Engine;
