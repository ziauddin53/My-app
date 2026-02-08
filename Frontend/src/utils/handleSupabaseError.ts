export function handleSupabaseError(error: any) {
  if (error) {
    console.error(error);
    throw error;
  }
}
