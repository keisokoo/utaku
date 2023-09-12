export type RemapBodyMode = 'add' | { id: string } | null

export const stepList = [
  'reference_url',
  'name',
  'host',
  'sub_domain',
  'params',
  'path_change',
  'replace',
] as const

export type StepNameType = typeof stepList[number]

export const getIndexByStepName = (stepName: StepNameType) => stepList.indexOf(stepName)