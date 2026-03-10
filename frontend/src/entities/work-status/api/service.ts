import type { WorkAction, WorkStatusRequestDTO, WorkStatusResponseDTO } from './dto';

import { apiClient } from '@/shared/api/apiClients';

export const workStatusService = {
  changeStatus: async (
    action: WorkAction,
    data?: WorkStatusRequestDTO,
  ): Promise<WorkStatusResponseDTO> => {
    const response = await apiClient.post<WorkStatusResponseDTO>({
      url: `/api/workstatus/${action.toLowerCase().replace('_', '-')}`,
      data,
    });

    return response;
  },
};
