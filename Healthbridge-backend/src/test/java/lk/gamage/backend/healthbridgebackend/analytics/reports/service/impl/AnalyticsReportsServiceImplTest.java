package lk.gamage.backend.healthbridgebackend.analytics.reports.service.impl;

import lk.gamage.backend.healthbridgebackend.analytics.dto.response.DataAvailability;
import lk.gamage.backend.healthbridgebackend.analytics.reports.dto.response.ReportsAnalyticsResponseDTO;
import org.junit.jupiter.api.Test;

import java.util.stream.Stream;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;

class AnalyticsReportsServiceImplTest {

    private final AnalyticsReportsServiceImpl service = new AnalyticsReportsServiceImpl(null, null, null, null);

    @Test
    void returnsPartialEmptyPersistenceAwareAnalyticsForSupportedPeriods() {
        Stream.of("today", "week", "month", "year").forEach(period -> {
            ReportsAnalyticsResponseDTO response = service.getReportsAnalytics(period);

            assertEquals(period, response.period());
            assertEquals(DataAvailability.PARTIAL, response.dataAvailability());
            assertEquals(4, response.kpis().size());
            assertEquals(4, response.kpis().stream().filter(kpi -> kpi.value() == null).count());
            assertEquals(0, response.reports().size());
            assertEquals(0, response.reportActivity().size());
            assertEquals(0, response.categoryDistribution().size());
            assertEquals(0, response.scheduledReports().size());
            assertEquals(6, response.availability().size());
        });
    }

    @Test
    void defaultsMissingPeriodToMonth() {
        assertEquals("month", service.getReportsAnalytics(null).period());
        assertEquals("month", service.getReportsAnalytics("").period());
    }

    @Test
    void rejectsUnsupportedPeriod() {
        assertThrows(IllegalArgumentException.class, () -> service.getReportsAnalytics("quarter"));
    }
}
