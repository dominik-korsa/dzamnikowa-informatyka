import * as admin from 'firebase-admin';

admin.initializeApp();

import generateNewJoinCode from './generateNewJoinCode';
import joinGroup from './joinGroup';

export { generateNewJoinCode, joinGroup };
