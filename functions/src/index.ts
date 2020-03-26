import * as admin from 'firebase-admin';

admin.initializeApp();

import generateNewJoinCode from './generateNewJoinCode';
import joinGroup from './joinGroup';
import newResourceTrigger from './newResourceTrigger';
import newGradeTrigger from "./newGradeTrigger";
import updateGradeTrigger from "./updateGradeTrigger";
import newAnswerTrigger from "./newAnswerTrigger";

export {
  generateNewJoinCode,
  joinGroup,
  newResourceTrigger,
  newGradeTrigger,
  updateGradeTrigger,
  newAnswerTrigger,
};
