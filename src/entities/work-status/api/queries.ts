import { workStatusService } from './service';

import type { WorkAction, WorkStatusRequestDTO } from './dto';

export const workStatusQueries = {
  workStatus: (action: WorkAction) => ({
    mutationFn: (data: WorkStatusRequestDTO) => workStatusService.changeStatus(action, data),
  }),
};
