package journalApp.exception;

public class JournalNotFoundException extends ResourceNotFoundException {
    public JournalNotFoundException(String message) {
        super(message);
    }
}
